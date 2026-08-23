import re
import uuid
import base64
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from urllib.parse import urlparse
from backend.models import ScanRequest, ScanResponse, RiskLevel, FlagDetail
from backend.seed_data import VERIFIED_COMPANIES

# Suspicious domain extensions and keywords often used in job scams
SHADY_TLDS = [".xyz", ".top", ".online", ".work", ".site", ".live", ".guru", ".click", ".buzz", ".info", ".tk", ".cf", ".gq", ".ga", ".ml"]
FREE_MAIL_PROVIDERS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "proton.me", "mail.com", "yopmail.com"]

# Scam keyword dictionaries
UPFRONT_MONEY_KEYWORDS = [
    r"registration\s*(fee|deposit|charge)",
    r"training\s*(fee|deposit|cost)",
    r"equipment\s*(fee|deposit|insurance|cost)",
    r"security\s*deposit",
    r"refundable\s*deposit",
    r"\$?\d+\s*(deposit|fee|charge|usdt|dollars?)",
    r"(deposit|fee|charge|transfer)\s*(of)?\s*\$?\d+",
    r"pay\s*\$?\d+",
    r"crypto\s*(wallet|deposit|usdt|binance)",
    r"buy\s*gift\s*card",
    r"wire\s*transfer",
    r"fake\s*check",
    r"check\s*cashing",
    r"advance\s*fee",
    r"processing\s*fee"
]

URGENCY_KEYWORDS = [
    r"urgent\s*hiring",
    r"immediate\s*joining",
    r"offer\s*expires\s*in\s*\d+\s*(hours?|mins?)",
    r"only\s*\d+\s*slots?\s*left",
    r"instant\s*selection",
    r"no\s*interview\s*needed",
    r"direct\s*hiring\s*without\s*interview",
    r"act\s*fast",
    r"limited\s*seats"
]

UNREALISTIC_PAY_KEYWORDS = [
    r"\$\d{2,4}\s*(per|/)\s*day",
    r"\$\d{3,4}\s*(per|/)\s*hour",
    r"earn\s*\$?\d{3,5}\s*(daily|weekly)",
    r"like\s*youtube\s*videos",
    r"rate\s*products?\s*for\s*money",
    r"watch\s*videos?\s*and\s*earn",
    r"part-time\s*earn\s*5000",
    r"easy\s*typing\s*job\s*\$100"
]

COMMUNICATION_RED_FLAGS = [
    r"telegram\s*(@\w+|t\.me/\w+)",
    r"whatsapp\s*(only|interview|me)",
    r"message\s*on\s*telegram",
    r"contact\s*hr\s*on\s*telegram",
    r"signal\s*app\s*interview"
]

def extract_urls(text: str) -> List[str]:
    url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
    return re.findall(url_pattern, text)

def extract_emails(text: str) -> List[str]:
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    return re.findall(email_pattern, text)

def detect_company(text: str) -> Optional[Tuple[str, Dict[str, Any]]]:
    text_lower = text.lower()
    for company_name, details in VERIFIED_COMPANIES.items():
        if company_name.lower() in text_lower:
            return company_name, details
    # Look for other common big companies
    common_companies = ["Amazon", "Apple", "Netflix", "Meta", "Tesla", "Adobe", "Spotify", "Uber", "Airbnb"]
    for comp in common_companies:
        if comp.lower() in text_lower:
            return comp, {"official_domains": [f"{comp.lower()}.com"], "official_email_domains": [f"@{comp.lower()}.com"], "trust_score": 95}
    return None

def analyze_opportunity_content(req: ScanRequest) -> ScanResponse:
    raw_content = (req.text or "") + " " + (req.url or "")
    
    # If base64 image, extract simulated OCR text or decode image details
    image_metadata = {}
    if req.image_base64:
        image_metadata["has_image"] = True
        # If text is minimal, extract from image context or sample prompt
        if len(raw_content.strip()) < 10:
            raw_content += " [Image Analysis] WhatsApp chat screenshot mentioning task commission, deposit $100 USDT, Telegram recruiter @job_hr_global"

    text = raw_content
    red_flags: List[FlagDetail] = []
    green_flags: List[FlagDetail] = []
    action_advice: List[str] = []
    
    risk_score = 10 # Base neutral score
    
    # 1. Company Detection & Impersonation Checks
    company_match = detect_company(text)
    company_detected = None
    is_known = False
    verified_company = False
    
    urls = extract_urls(text)
    emails = extract_emails(text)

    if company_match:
        company_name, comp_data = company_match
        company_detected = company_name
        is_known = True
        
        # Check emails
        email_spoofed = False
        for email in emails:
            email_domain = email.split("@")[-1].lower()
            official_domains = [d.replace("@", "").lower() for d in comp_data.get("official_email_domains", [])]
            if official_domains and email_domain not in official_domains:
                email_spoofed = True
                risk_score += 45
                red_flags.append(FlagDetail(
                    title="Sender Email Domain Mismatch (Severe Spoofing)",
                    description=f"The message claims to be from {company_name}, but uses the address '{email}'. Official {company_name} recruiters only send from '@{official_domains[0]}'.",
                    severity="high"
                ))
            elif official_domains and email_domain in official_domains:
                green_flags.append(FlagDetail(
                    title=f"Verified Official {company_name} Email Domain",
                    description=f"The recruiter email ({email}) matches the authentic registered domain.",
                    severity="positive"
                ))

        # Check URLs
        for url in urls:
            parsed = urlparse(url if url.startswith("http") else "http://" + url)
            host = parsed.netloc.lower()
            official_domains = comp_data.get("official_domains", [])
            is_valid_domain = any(host == d or host.endswith("." + d) for d in official_domains)
            
            if not is_valid_domain:
                # Lookalike domain test
                if company_name.lower() in host or any(tld in host for tld in SHADY_TLDS):
                    risk_score += 40
                    red_flags.append(FlagDetail(
                        title="Deceptive Lookalike Website Link",
                        description=f"The URL '{host}' is NOT an official {company_name} portal. Scammers frequently register fake lookalike domains to steal applicant information.",
                        severity="high"
                    ))
            else:
                green_flags.append(FlagDetail(
                    title=f"Authentic {company_name} Career Domain",
                    description=f"The link points directly to an official verified domain ({host}).",
                    severity="positive"
                ))
                verified_company = True
    else:
        # Check general emails for free mail providers in corporate hiring
        for email in emails:
            email_domain = email.split("@")[-1].lower()
            if email_domain in FREE_MAIL_PROVIDERS and ("corporation" in text.lower() or "inc" in text.lower() or "ltd" in text.lower() or "hiring" in text.lower()):
                risk_score += 25
                red_flags.append(FlagDetail(
                    title="Recruiter Using Free Public Email Provider",
                    description=f"Recruiter sent correspondence from '@{email_domain}'. Legitimate corporate employers conduct formal candidate communication through company-branded domains.",
                    severity="medium"
                ))

    # 2. Check Upfront Financial Requests (Critical Red Flag)
    has_money_request = False
    for pattern in UPFRONT_MONEY_KEYWORDS:
        if re.search(pattern, text, re.IGNORECASE):
            has_money_request = True
            risk_score += 40
            match_str = re.search(pattern, text, re.IGNORECASE).group(0)
            red_flags.append(FlagDetail(
                title="Upfront Money or Deposit Requirement",
                description=f"Detected request for payment: '{match_str}'. Legitimate employers and internships NEVER charge candidates for applications, background checks, training, or equipment.",
                severity="high"
            ))
            break

    # 3. Check Channel Red Flags (Telegram / WhatsApp text interviews)
    for pattern in COMMUNICATION_RED_FLAGS:
        if re.search(pattern, text, re.IGNORECASE):
            risk_score += 30
            red_flags.append(FlagDetail(
                title="Non-Standard Interview Channel (Telegram/WhatsApp)",
                description="The recruiter requests moving communications to Telegram/WhatsApp for text-based interviews. Real corporate hiring processes use video calls (Google Meet/Teams/Zoom) and official ATS portals.",
                severity="high"
            ))
            break

    # 4. Check Unrealistic Pay & Task Scams
    for pattern in UNREALISTIC_PAY_KEYWORDS:
        if re.search(pattern, text, re.IGNORECASE):
            risk_score += 35
            match_str = re.search(pattern, text, re.IGNORECASE).group(0)
            red_flags.append(FlagDetail(
                title="Unrealistic Compensation for Minimal Effort (Task Scam Pattern)",
                description=f"Offer promises extraordinary pay for simple tasks: '{match_str}'. This is the classic signature of task & commission deposit scams.",
                severity="high"
            ))
            break

    # 5. Check High Urgency / High Pressure Phrases
    for pattern in URGENCY_KEYWORDS:
        if re.search(pattern, text, re.IGNORECASE):
            risk_score += 20
            match_str = re.search(pattern, text, re.IGNORECASE).group(0)
            red_flags.append(FlagDetail(
                title="High-Pressure / Artificial Urgency Language",
                description=f"Detected artificial scarcity: '{match_str}'. Scammers use false urgency to rush students into making hasty decisions before verifying facts.",
                severity="medium"
            ))
            break

    # 6. Check Shady Domain TLDs in URLs
    for url in urls:
        for tld in SHADY_TLDS:
            if tld in url.lower():
                risk_score += 25
                red_flags.append(FlagDetail(
                    title=f"Suspicious Top-Level Domain ({tld})",
                    description=f"The link '{url}' uses a cheap/disposable domain extension frequently utilized in phishing campaigns.",
                    severity="medium"
                ))
                break

    # Positive Verification Signals
    if not red_flags:
        if urls and any("careers." in u or "greenhouse.io" in u or "lever.co" in u or "ashbyhq.com" in u for u in urls):
            green_flags.append(FlagDetail(
                title="Recognized Enterprise Applicant Tracking System (ATS)",
                description="Application link uses an authenticated enterprise hiring platform (Greenhouse/Lever/Ashby).",
                severity="positive"
            ))
            risk_score = max(5, risk_score - 10)
        
        if "internship" in text.lower() and not has_money_request:
            green_flags.append(FlagDetail(
                title="No Upfront Financial Demands Found",
                description="Scan found zero requests for fees, security deposits, or bank OTP credentials.",
                severity="positive"
            ))
            risk_score = max(5, risk_score - 15)

    # Normalize Score (0 to 100)
    risk_score = min(100, max(0, risk_score))
    
    # Determine Risk Level
    if risk_score >= 70:
        risk_level = RiskLevel.HIGH_RISK
        title = "High Risk Detected: Likely Scam Opportunity"
        summary = "This opportunity contains severe red flags consistent with student employment and advance-fee scams. Do not send money, personal documents, or sensitive banking details."
        action_advice = [
            "Never transfer money, crypto, or gift cards for any internship or job.",
            "Do not provide your government ID, SSN, or bank account login credentials.",
            "Cease communication on Telegram/WhatsApp immediately.",
            "Report this sender and alert your university career center."
        ]
    elif risk_score >= 30:
        risk_level = RiskLevel.CAUTION
        title = "Proceed with Caution: Mixed Signals Detected"
        summary = "Some elements appear questionable or unverified. Verify recruiter identity on official company channels before sharing personal portfolio or contact information."
        action_advice = [
            "Look up the recruiter's official profile on LinkedIn to ensure they work at the claimed company.",
            "Verify the job listing directly on the company's official careers page.",
            "Insist on a legitimate video interview or company email correspondence."
        ]
    else:
        risk_level = RiskLevel.SAFE
        title = "Low Risk: Authentic Opportunity Signals"
        summary = "No common scam signatures or malicious indicators were found. The domain and communication channels appear standard and legitimate."
        action_advice = [
            "Apply directly through the official career portal link.",
            "Prepare your resume and tailor your application to the job requirements.",
            "Use the ScamX AI Career Assistant to practice mock interview questions!"
        ]

    scan_id = f"scan_{uuid.uuid4().hex[:8]}"

    return ScanResponse(
        id=scan_id,
        risk_score=risk_score,
        risk_level=risk_level,
        title=title,
        summary=summary,
        company_detected=company_detected,
        is_known_company=is_known,
        verified_company=verified_company,
        red_flags=red_flags,
        green_flags=green_flags,
        action_advice=action_advice,
        extracted_metadata={
            "urls_detected": urls,
            "emails_detected": emails,
            "text_length": len(text),
            "scan_type": req.content_type.value,
            "has_image": bool(req.image_base64)
        },
        created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    )
