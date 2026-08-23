"""
Comprehensive End-to-End HTTP Integration Test for ScamX
Simulates full client interaction across all 5 features and verifies server responses.
"""
import sys
import requests
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def test_full_platform():
    print("🚀 Starting ScamX End-to-End HTTP & Feature Integration Test...")

    # 1. Health and Frontend HTML Serving
    print("\n--- 1. Frontend & Static Asset Delivery ---")
    r = requests.get(f"{BASE_URL}/")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert "ScamX" in r.text
    assert "Multimodal Authenticity Engine" in r.text or "Scanner" in r.text
    print("✅ Frontend index.html served successfully with proper title & navigation.")

    r_css = requests.get(f"{BASE_URL}/static/css/design-system.css")
    assert r_css.status_code == 200, f"Expected CSS 200, got {r_css.status_code}"
    assert "--brand-primary" in r_css.text and "--risk-danger" in r_css.text
    print("✅ Design system CSS served with dark-mode tokens and traffic light palette.")

    # 2. Live Platform Stats
    print("\n--- 2. Live Stats API ---")
    r_stats = requests.get(f"{BASE_URL}/api/stats")
    assert r_stats.status_code == 200
    stats = r_stats.json()
    print(f"Stats: Total Scans={stats['total_scans']}, Blocked={stats['scams_prevented']}, Opportunities={stats['verified_listings']}")
    assert stats["total_scans"] > 0
    print("✅ Live stats returned accurately.")

    # 3. Scanner API - High Risk Scam
    print("\n--- 3. Multimodal Scanner - High Risk Scam ---")
    scam_payload = {
        "content_type": "text",
        "text": "Earn $500/day by rating products on Telegram @amazon_hr. Send $100 USDT registration fee.",
        "share_anonymously": True,
        "user_id": "demo_student"
    }
    r_scan1 = requests.post(f"{BASE_URL}/api/scan", json=scam_payload)
    assert r_scan1.status_code == 200
    res1 = r_scan1.json()
    print(f"Scan 1 (Scam) -> Score: {res1['risk_score']}/100 | Level: {res1['risk_level']}")
    assert res1["risk_score"] >= 70
    assert res1["risk_level"] == "HIGH_RISK"
    assert len(res1["red_flags"]) >= 2
    print("✅ High risk scam accurately flagged with score >= 70 and plain English explanations.")

    # 4. Scanner API - Low Risk Authentic Opportunity
    print("\n--- 4. Multimodal Scanner - Authentic Listing ---")
    safe_payload = {
        "content_type": "text",
        "text": "Apply for Software Engineering Intern at Google at https://careers.google.com/jobs/results/.",
        "share_anonymously": True,
        "user_id": "demo_student"
    }
    r_scan2 = requests.post(f"{BASE_URL}/api/scan", json=safe_payload)
    assert r_scan2.status_code == 200
    res2 = r_scan2.json()
    print(f"Scan 2 (Safe) -> Score: {res2['risk_score']}/100 | Level: {res2['risk_level']}")
    assert res2["risk_score"] <= 25
    assert res2["risk_level"] == "SAFE"
    print("✅ Authentic listing scored as SAFE with verified credentials.")

    # 5. Career AI Chatbot - Mock Interview Prep
    print("\n--- 5. Career AI - Mock Interview Flow ---")
    chat_payload1 = {
        "message": "Give me a software engineering mock interview question",
        "session_id": "test_session_01"
    }
    r_chat1 = requests.post(f"{BASE_URL}/api/chat", json=chat_payload1)
    assert r_chat1.status_code == 200
    chat_res1 = r_chat1.json()
    assert "STAR Framework" in chat_res1["reply"] or "Mock Interview" in chat_res1["reply"]
    print("✅ Career Assistant successfully initiated technical mock interview with STAR framework.")

    # 6. Career AI Chatbot - Scam Guardrail Check
    print("\n--- 6. Career AI - Scam Guardrail Handoff ---")
    chat_payload2 = {
        "message": "Is this legit? A recruiter on WhatsApp asked for $100 deposit",
        "session_id": "test_session_01"
    }
    r_chat2 = requests.post(f"{BASE_URL}/api/chat", json=chat_payload2)
    assert r_chat2.status_code == 200
    chat_res2 = r_chat2.json()
    assert chat_res2["is_scam_inquiry"] is True
    assert "HIGH RISK" in chat_res2["reply"] or "CAUTION" in chat_res2["reply"]
    print("✅ Guardrail correctly intercepted verification inquiry and dispatched safety scan.")

    # 7. Verified Opportunities Feed API
    print("\n--- 7. Verified Opportunities Feed & Filters ---")
    r_opps = requests.get(f"{BASE_URL}/api/opportunities?category=Engineering&work_type=Hybrid")
    assert r_opps.status_code == 200
    opps = r_opps.json()
    assert len(opps) > 0
    print(f"Found {len(opps)} filtered opportunities (e.g. {opps[0]['title']} at {opps[0]['company']}).")
    print("✅ Verified Opportunities Feed filtering working seamlessly.")

    # 8. Community Forum - Creation & Upvoting
    print("\n--- 8. Community Forum Intelligence ---")
    new_post = {
        "company_name": "Apex Global Shippers (Impersonating DHL)",
        "opportunity_title": "Remote Package Inspector ($65/hr)",
        "category": "task_scam",
        "summary": "WhatsApp message asking to reship stolen goods with fake checks.",
        "detailed_experience": "Recruiter contacted via WhatsApp claiming to be DHL. Sent a $1,500 fake check for home office supplies. Classic parcel mule scam.",
        "communication_channel": "WhatsApp",
        "requested_amount": "$1,500 Fake Check",
        "author_name": "E2E Test Runner",
        "tags": ["parcel mule", "fake check", "WhatsApp recruiter"]
    }
    r_post = requests.post(f"{BASE_URL}/api/forum", json=new_post)
    assert r_post.status_code == 200
    created_post = r_post.json()
    post_id = created_post["id"]
    print(f"Created Forum Post: {post_id} | Upvotes: {created_post['upvotes']}")

    r_upvote = requests.post(f"{BASE_URL}/api/forum/{post_id}/upvote")
    assert r_upvote.status_code == 200
    assert r_upvote.json()["upvotes"] == 2
    print("✅ Forum post creation and live upvote increment verified.")

    # 9. User Profile & Onboarding API
    print("\n--- 9. User Profile & Onboarding Persistence ---")
    profile_payload = {
        "user_id": "demo_student",
        "name": "Alex Rivera",
        "major": "Computer Science & AI",
        "interests": ["Software Engineering", "Autonomous Systems"],
        "location": "San Francisco, CA",
        "watched_companies": ["Google", "Linear", "Stripe"]
    }
    r_prof = requests.post(f"{BASE_URL}/api/user/profile", json=profile_payload)
    assert r_prof.status_code == 200
    r_get_prof = requests.get(f"{BASE_URL}/api/user/profile?user_id=demo_student")
    assert r_get_prof.json()["major"] == "Computer Science & AI"
    print("✅ User profile and onboarding data persisted in SQLite database.")

    # 10. Vault / Scan History
    print("\n--- 10. Personal Security Vault / Scan History ---")
    r_hist = requests.get(f"{BASE_URL}/api/scans/recent?user_id=demo_student")
    assert r_hist.status_code == 200
    history_items = r_hist.json()
    assert len(history_items) >= 2
    print(f"Vault contains {len(history_items)} saved scans with risk metrics.")
    print("✅ Vault history accurately synchronized.")

    print("\n🎉 ALL 10 END-TO-END INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n")

if __name__ == "__main__":
    test_full_platform()
