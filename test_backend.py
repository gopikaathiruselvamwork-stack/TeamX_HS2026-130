"""
Automated Test Suite for ScamX Backend & Scoring Engine
"""
import sys
import os

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.models import ForumPost, RiskLevel, ScanRequest, ScanType
from backend.scanner_engine import analyze_opportunity_content
from backend.career_ai import process_career_chat, ChatRequest
from backend.database import init_db, list_opportunities, list_forum_posts, create_forum_post, upvote_forum_post

def run_tests():
    print("[*] Initializing ScamX Test Suite...")
    init_db()
    
    # Test 1: Severe Scam Test Case (Task & Crypto Deposit)
    print("\n--- Test 1: Task & Crypto Deposit Scam Detection ---")
    scam_req = ScanRequest(
        content_type=ScanType.TEXT,
        text="Jessica from Amazon HR. Earn $500 per day by rating products on Telegram @amazon_hr. Deposit $100 USDT refundable registration fee."
    )
    scam_res = analyze_opportunity_content(scam_req)
    print(f"Risk Score: {scam_res.risk_score} | Level: {scam_res.risk_level.value}")
    assert scam_res.risk_score >= 70, f"Expected score >= 70, got {scam_res.risk_score}"
    assert scam_res.risk_level == RiskLevel.HIGH_RISK
    assert len(scam_res.red_flags) >= 2, "Expected multiple red flags detected"
    print("[PASS] Test 1 Passed: Severe Scam correctly classified as HIGH_RISK with red flags.")

    # Test 2: Spoofed Email Domain Test Case
    print("\n--- Test 2: Spoofed Lookalike Email Domain ---")
    spoof_req = ScanRequest(
        content_type=ScanType.TEXT,
        text="Official offer from Google LLC! Reply to recruiter at hr-recruiting@gmai1-support.com or visit http://google-careers-portal.xyz/pay-deposit"
    )
    spoof_res = analyze_opportunity_content(spoof_req)
    print(f"Risk Score: {spoof_res.risk_score} | Level: {spoof_res.risk_level.value}")
    assert spoof_res.risk_score >= 70, f"Expected score >= 70, got {spoof_res.risk_score}"
    assert any("Sender Email Domain Mismatch" in f.title for f in spoof_res.red_flags), "Expected email spoof red flag"
    print("[PASS] Test 2 Passed: Email mismatch correctly triggered severe red flag.")

    # Test 3: Authentic Google SWE Listing
    print("\n--- Test 3: Authentic Job Opportunity ---")
    legit_req = ScanRequest(
        content_type=ScanType.TEXT,
        text="Apply for Google Software Engineering Intern 2026 at https://careers.google.com/jobs/results/. Google never charges application fees."
    )
    legit_res = analyze_opportunity_content(legit_req)
    print(f"Risk Score: {legit_res.risk_score} | Level: {legit_res.risk_level.value}")
    assert legit_res.risk_score <= 25, f"Expected score <= 25, got {legit_res.risk_score}"
    assert legit_res.risk_level == RiskLevel.SAFE
    print("[PASS] Test 3 Passed: Authentic opportunity recognized as SAFE with verified badges.")

    # Test 4: Career AI Guardrail Handoff
    print("\n--- Test 4: Career AI Scam Verification Guardrail ---")
    chat_req = ChatRequest(message="Is this job legit? The recruiter wants to interview on Telegram and asked for a $50 training fee")
    chat_res = process_career_chat(chat_req)
    assert chat_res.is_scam_inquiry is True, "Expected is_scam_inquiry to be True"
    assert "HIGH RISK" in chat_res.reply or "CAUTION" in chat_res.reply, "Expected risk alert in reply"
    print("[PASS] Test 4 Passed: AI Assistant successfully enforced verification guardrail.")

    # Test 5: Opportunities & Forum DB Operations
    print("\n--- Test 5: Database Querying & Upvoting ---")
    opps = list_opportunities(category="Engineering")
    assert len(opps) > 0, "Expected engineering opportunities"
    print(f"Found {len(opps)} engineering opportunities.")

    posts = list_forum_posts()
    assert len(posts) > 0, "Expected seeded forum posts"
    initial_upvotes = posts[0].upvotes
    new_upvotes = upvote_forum_post(posts[0].id)
    assert new_upvotes == initial_upvotes + 1, f"Expected upvotes to increment to {initial_upvotes + 1}, got {new_upvotes}"
    print("[PASS] Test 5 Passed: Database queries and upvoting functioning as expected.")

    print("\n[SUCCESS] ALL 5 TEST SUITES PASSED PERFECTLY!\n")

if __name__ == "__main__":
    run_tests()
