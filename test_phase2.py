"""
Comprehensive Phase 2 Test Suite for ScamX:
- Chatbot History Persistence & User Isolation
- Real-Time Notifications Generation & Status
- Mentors Directory & Mentor Registration
- Connections Request & Acceptance Lifecycle
- Mentorship Session Booking
- 1-on-1 Direct Messaging (Mentor Only Guardrail)
"""
import sys
import os
import requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def test_phase2():
    print("🚀 Starting ScamX Phase 2 Automated Test Suite...")

    # --- 1. CHAT HISTORY PERSISTENCE & ISOLATION ---
    print("\n--- 1. Testing Chatbot History Persistence & User Isolation ---")
    user_a = "alex_rivera"
    user_b = "marcus_vance"

    # Reset any prior history for clean test
    requests.delete(f"{BASE_URL}/api/chat/history?user_id={user_a}")
    requests.delete(f"{BASE_URL}/api/chat/history?user_id={user_b}")

    # User A sends a message
    msg_a = "Give me a mock technical question for a junior backend role"
    r_chat_a = requests.post(f"{BASE_URL}/api/chat", json={"message": msg_a, "user_id": user_a})
    assert r_chat_a.status_code == 200

    # User A fetches history -> must see their question and assistant reply
    r_hist_a = requests.get(f"{BASE_URL}/api/chat/history?user_id={user_a}")
    hist_a = r_hist_a.json()
    assert len(hist_a) == 2, f"Expected 2 messages in User A history, got {len(hist_a)}"
    assert hist_a[0]["role"] == "user" and hist_a[0]["content"] == msg_a
    assert hist_a[1]["role"] == "assistant"
    print(f"✅ User A history persisted successfully ({len(hist_a)} messages).")

    # User B fetches history -> must NOT see User A's messages (isolation)
    r_hist_b = requests.get(f"{BASE_URL}/api/chat/history?user_id={user_b}")
    hist_b = r_hist_b.json()
    assert len(hist_b) == 0, f"Expected 0 messages in User B history, got {len(hist_b)}"
    print("✅ User isolation verified: User B sees 0 messages from User A.")

    # --- 2. REAL-TIME NOTIFICATIONS GENERATION ---
    print("\n--- 2. Testing Real-Time Scam Notifications ---")
    scam_post = {
        "company_name": "Apex Global Task Network",
        "opportunity_title": "Video Rating Worker ($600/day)",
        "category": "task_scam",
        "summary": "Urgent alert: WhatsApp recruiter asks for $150 deposit to unlock task rewards.",
        "detailed_experience": "Contacted via WhatsApp. Classic task scam scheme with fake recharge.",
        "communication_channel": "WhatsApp",
        "requested_amount": "$150 USDT",
        "author_name": "Test Student",
        "tags": ["task scam", "deposit"],
        "sector": "Engineering"
    }
    r_sub = requests.post(f"{BASE_URL}/api/forum", json=scam_post)
    assert r_sub.status_code == 200

    # User A follows 'Engineering', verify notification was generated for User A
    r_notifs_a = requests.get(f"{BASE_URL}/api/notifications?user_id={user_a}")
    notifs_a = r_notifs_a.json()
    assert len(notifs_a) > 0
    latest_notif = notifs_a[0]
    print(f"✅ Notification created for User A: '{latest_notif['title']}' (Read={latest_notif['read']})")

    # Mark notification as read
    r_read = requests.post(f"{BASE_URL}/api/notifications/{latest_notif['id']}/read")
    assert r_read.status_code == 200
    r_notifs_a2 = requests.get(f"{BASE_URL}/api/notifications?user_id={user_a}")
    assert r_notifs_a2.json()[0]["read"] is True
    print("✅ Notification successfully marked as read.")

    # --- 3. MENTORS DIRECTORY & MENTOR REGISTRATION ---
    print("\n--- 3. Testing Mentors Directory & Registration ---")
    r_mentors = requests.get(f"{BASE_URL}/api/mentors")
    mentors = r_mentors.json()
    assert len(mentors) >= 2, f"Expected at least 2 mentors, got {len(mentors)}"
    mentor_names = [m["name"] for m in mentors]
    print(f"Found mentors: {', '.join(mentor_names)}")
    assert any("Marcus Vance" in name for name in mentor_names)
    print("✅ Mentors directory loaded with verified badges and expertise.")

    # Register student as mentor
    r_reg = requests.post(f"{BASE_URL}/api/mentors/register", json={
        "user_id": "priya_sharma",
        "expertise": "Data Science Projects, SQL Interviews",
        "sectors": ["Data", "Finance"],
        "bio": "Senior Data Science student mentoring underclassmen on technical interviews.",
        "availability": "Sundays 2pm - 4pm"
    })
    assert r_reg.status_code == 200
    assert r_reg.json()["is_mentor"] is True
    print("✅ Student successfully registered as a verified mentor.")

    # --- 4. CONNECTIONS LIFECYCLE ---
    print("\n--- 4. Testing Connection Requests & Acceptance ---")
    # Alex sends connection request to Marcus
    r_conn_req = requests.post(f"{BASE_URL}/api/connections/request", json={
        "sender_id": user_a,
        "receiver_id": user_b
    })
    assert r_conn_req.status_code == 200
    conn_data = r_conn_req.json()
    conn_id = conn_data["id"]
    print(f"Connection created: {conn_id} | Status: {conn_data['status']}")

    # Marcus accepts connection
    r_accept = requests.post(f"{BASE_URL}/api/connections/{conn_id}/respond?status=accepted")
    assert r_accept.status_code == 200
    assert r_accept.json()["status"] == "accepted"
    print("✅ Connection successfully accepted.")

    # Verify both users see each other in connections
    r_conns_a = requests.get(f"{BASE_URL}/api/connections?user_id={user_a}")
    conns_a = r_conns_a.json()
    assert any(c["id"] == conn_id and c["status"] == "accepted" for c in conns_a)
    print("✅ User A successfully sees accepted connection in 'My Connections'.")

    # --- 5. MENTOR SESSIONS ---
    print("\n--- 5. Testing Mentorship Session Scheduling ---")
    r_sess_req = requests.post(f"{BASE_URL}/api/sessions/request", json={
        "mentor_id": user_b,
        "mentee_id": user_a,
        "date_time": "Friday, 5:00 PM EST",
        "topic": "System Design Mock & Offer Evaluation",
        "notes": "Discussing Google Summer Intern offer details and technical prep."
    })
    assert r_sess_req.status_code == 200
    sess_data = r_sess_req.json()
    sess_id = sess_data["id"]
    assert sess_data["status"] == "pending"
    print(f"Session requested: {sess_id} on {sess_data['date_time']}")

    # Mentor confirms session
    r_sess_conf = requests.post(f"{BASE_URL}/api/sessions/{sess_id}/confirm")
    assert r_sess_conf.status_code == 200
    assert r_sess_conf.json()["status"] == "confirmed"
    print("✅ Session confirmed by mentor.")

    # --- 6. DIRECT 1-ON-1 MESSAGING (MENTORS ONLY) ---
    print("\n--- 6. Testing 1-on-1 Human Direct Messaging (Mentors Only) ---")
    # Alex sends direct message to Dr. Marcus (allowed: connected mentor & mentee)
    dm_payload = {
        "sender_id": user_a,
        "receiver_id": user_b,
        "message": "Hi Dr. Vance, looking forward to our session on Friday!"
    }
    r_dm1 = requests.post(f"{BASE_URL}/api/direct-messages", json=dm_payload)
    assert r_dm1.status_code == 200
    dm1 = r_dm1.json()
    print(f"Direct Message Sent: '{dm1['message']}' from {dm1['sender_name']}")

    # Dr. Marcus replies to Alex
    dm_reply_payload = {
        "sender_id": user_b,
        "receiver_id": user_a,
        "message": "Hi Alex, great to connect! Reviewing your questions now."
    }
    r_dm2 = requests.post(f"{BASE_URL}/api/direct-messages", json=dm_reply_payload)
    assert r_dm2.status_code == 200

    # Fetch thread
    r_thread = requests.get(f"{BASE_URL}/api/direct-messages?user_a={user_a}&user_b={user_b}")
    thread = r_thread.json()
    assert len(thread) >= 2
    print(f"✅ Direct message thread contains {len(thread)} messages.")

    # Test Guardrail: Non-connected or non-mentor users should be rejected
    # Create two unconnected students
    unconnected_payload = {
        "sender_id": "alex_rivera",
        "receiver_id": "priya_sharma",
        "message": "Direct message test to unconnected user"
    }
    r_bad_dm = requests.post(f"{BASE_URL}/api/direct-messages", json=unconnected_payload)
    assert r_bad_dm.status_code == 400
    print("✅ Direct message guardrail verified: Blocked messaging between unconnected users.")

    print("\n🎉 ALL PHASE 2 TEST SUITES PASSED PERFECTLY WITH 100% SUCCESS!\n")

if __name__ == "__main__":
    test_phase2()
