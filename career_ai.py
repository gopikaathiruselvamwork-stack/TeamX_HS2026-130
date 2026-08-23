import re
from typing import Dict, Any, List, Optional
from backend.models import ChatRequest, ChatResponse, Opportunity, ScanRequest, ScanType
from backend.database import list_opportunities, list_forum_posts, get_recent_scans
from backend.scanner_engine import analyze_opportunity_content

MOCK_INTERVIEW_QUESTIONS = {
    "software": [
        "Can you explain the difference between a process and a thread, and how you would debug a race condition in Python or C++?",
        "Tell me about a time you optimized a slow API or database query. What profiling tools did you use and what was the outcome?",
        "How would you design a scalable URL shortener service that handles 10,000 requests per second?"
    ],
    "design": [
        "Walk me through a project where user research fundamentally changed your initial design direction.",
        "How do you balance aesthetic delight with accessibility (WCAG 2.1 standards) in your component libraries?",
        "Describe how you handle conflicting feedback from product managers and engineers on a Figma prototype."
    ],
    "data": [
        "How do you detect and handle data skew in distributed processing frameworks like Spark or SQL pipelines?",
        "Explain how you prevent overfitting in a predictive model when dealing with high-dimensional sparse data.",
        "Walk me through an A/B test you designed. How did you determine sample size and statistical significance?"
    ],
    "general": [
        "Why are you interested in this internship role, and what specific technical challenge are you hoping to tackle?",
        "Describe a situation where a team project ran behind schedule. How did you prioritize tasks to deliver on time?",
        "What is a recent technology or engineering breakthrough you learned about on your own outside of class?"
    ]
}

def process_career_chat(req: ChatRequest) -> ChatResponse:
    message = req.message.strip()
    msg_lower = message.lower()
    
    # 1. Guardrail Check: Scam or Verification Inquiry
    # When asked "Is X legit?", "Is this company real?", "Check if this job is safe"
    verification_triggers = [
        "is this legit", "is it a scam", "is this real", "is this company safe",
        "check this job", "verify this", "can i trust", "scam check", "is it authentic"
    ]
    
    is_verification = any(trigger in msg_lower for trigger in verification_triggers)
    
    if is_verification or ("whatsapp" in msg_lower and "job" in msg_lower) or ("telegram" in msg_lower and "interview" in msg_lower):
        # Trigger real-time scanner bridge!
        scan_res = analyze_opportunity_content(ScanRequest(
            content_type=ScanType.TEXT,
            text=message,
            share_anonymously=True
        ))
        
        reply = f"🛡️ **ScamX Safety Verification Check**\n\n"
        if scan_res.risk_score >= 70:
            reply += f"⚠️ **HIGH RISK ALERT (Score: {scan_res.risk_score}/100)**\n"
            reply += f"Based on our authenticity scanner, this opportunity contains clear indicators of a scam. **Do not send money, deposits, or personal banking info.**\n\n"
            reply += "**Key Red Flags Detected:**\n"
            for rf in scan_res.red_flags:
                reply += f"• **{rf.title}**: {rf.description}\n"
            reply += f"\n💡 **Advice**: {scan_res.action_advice[0]}"
        elif scan_res.risk_score >= 30:
            reply += f"⚠️ **CAUTION ADVISED (Score: {scan_res.risk_score}/100)**\n"
            reply += f"We found mixed or unverified signals. Exercise caution before sharing sensitive documents.\n\n"
            for rf in scan_res.red_flags:
                reply += f"• **{rf.title}**: {rf.description}\n"
        else:
            reply += f"✅ **LOW RISK (Score: {scan_res.risk_score}/100)**\n"
            reply += f"No immediate malicious patterns detected. Make sure you apply through the company's verified careers portal."

        return ChatResponse(
            reply=reply,
            is_scam_inquiry=True,
            suggested_actions=["Run Full Multimodal Scan", "Search Forum for Reports", "Browse Verified Opportunities"]
        )

    # 2. Mock Interview Mode
    if "mock interview" in msg_lower or "interview prep" in msg_lower or "practice question" in msg_lower:
        category = "software"
        if "design" in msg_lower or "ui" in msg_lower or "ux" in msg_lower:
            category = "design"
        elif "data" in msg_lower or "ml" in msg_lower or "ai" in msg_lower:
            category = "data"

        q_list = MOCK_INTERVIEW_QUESTIONS.get(category, MOCK_INTERVIEW_QUESTIONS["software"])
        selected_q = q_list[0]
        
        reply = (
            f"🎯 **Mock Interview Simulation ({category.capitalize()} Role)**\n\n"
            f"Let's practice! Here is your technical interview question:\n\n"
            f"👉 **\"{selected_q}\"**\n\n"
            f"**How to answer (STAR Framework):**\n"
            f"1. **Situation**: Briefly describe the context.\n"
            f"2. **Task**: What was your core responsibility?\n"
            f"3. **Action**: What specific technical steps did you take?\n"
            f"4. **Result**: Quantify the impact (e.g., 'reduced latency by 40%').\n\n"
            f"💬 *Type your answer below, and I will critique your structure and technical clarity!*"
        )
        return ChatResponse(
            reply=reply,
            suggested_actions=["Give me another question", "Help me structure my answer", "Resume Review Tips"]
        )

    # 3. Opportunity Discovery / Recommendations
    if any(k in msg_lower for k in ["find", "recommend", "internship", "job", "opps", "openings", "summer"]):
        matching_opps = list_opportunities()[:3]
        opp_list_text = ""
        for opp in matching_opps:
            opp_list_text += f"• **{opp.title}** at **{opp.company}** ({opp.work_type})\n  Stipend: {opp.stipend} | Trust Score: {opp.trust_score}/100 🛡️\n"
        
        reply = (
            f"🌟 **Top Verified Opportunities Matching Your Profile**\n\n"
            f"{opp_list_text}\n"
            f"All these listings have been proactively verified by ScamX to ensure authentic recruiter emails, zero fees, and verified company domains.\n\n"
            f"Would you like me to help tailor your resume for any of these roles?"
        )
        return ChatResponse(
            reply=reply,
            verified_opportunities=matching_opps,
            suggested_actions=["Tailor resume for Google", "Tailor resume for Canva", "Start Mock Interview"]
        )

    # 4. Resume & Career Advice
    if "resume" in msg_lower or "cv" in msg_lower:
        reply = (
            f"📄 **High-Impact Student Resume Tips for 2026**\n\n"
            f"1. **Quantify Results**: Use the Google formula: *'Accomplished [X], as measured by [Y], by doing [Z]'*.\n"
            f"2. **Lead with Projects**: If you're looking for your 1st/2nd internship, showcase full-stack projects with live URLs, GitHub repos, and clear architecture notes.\n"
            f"3. **ATS-Friendly Formatting**: Use clean single-column markdown/PDF with standard headers (Experience, Projects, Education, Skills).\n"
            f"4. **Safety Check**: Never put your full home address or sensitive personal ID numbers on publicly shared resumes."
        )
        return ChatResponse(
            reply=reply,
            suggested_actions=["Practice Technical Interview", "Explore Verified Tech Jobs", "Check a suspicious offer"]
        )

    # Default Helpful Response — personalize greeting from user_id
    first_name = req.user_id.split("_")[0].capitalize() if req.user_id else "there"
    return ChatResponse(
        reply=(
            f"👋 Hi {first_name}! I'm your **ScamX AI Career & Safety Assistant**.\n\n"
            f"Here is how I can support your internship search:\n"
            f"• 🛡️ **Verify suspicious offers**: Paste any DM, WhatsApp chat, or email to check if it's safe.\n"
            f"• 💼 **Find verified internships**: Discover genuine roles with verified stipends and direct links.\n"
            f"• 🎤 **Mock Interviews**: Practice real technical and behavioral interview questions.\n"
            f"• 📝 **Resume feedback**: Get actionable advice to stand out to verified recruiters.\n\n"
            f"What would you like to explore today?"
        ),
        suggested_actions=["Start Mock Interview", "Verify an Opportunity", "Browse Safe Internships"]
    )
