import sqlite3
import json
import os
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.models import (
    Opportunity, ForumPost, ScanResponse, UserProfile, RiskLevel,
    ChatMessageRecord, NotificationItem, ConnectionItem, MentorSession, DirectMessage
)
from backend.seed_data import SEED_OPPORTUNITIES, SEED_FORUM_POSTS, VERIFIED_COMPANIES

DB_PATH = os.path.join(os.path.dirname(__file__), "scamx.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Opportunities Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        company_logo TEXT,
        location TEXT,
        work_type TEXT,
        role_category TEXT,
        stipend TEXT,
        description TEXT,
        requirements TEXT,
        trust_score INTEGER,
        trust_level TEXT,
        trust_reasons TEXT,
        source_url TEXT,
        source_platform TEXT,
        posted_date TEXT,
        verified_badge INTEGER
    )
    """)

    # Forum Posts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS forum_posts (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        opportunity_title TEXT NOT NULL,
        category TEXT NOT NULL,
        summary TEXT NOT NULL,
        detailed_experience TEXT NOT NULL,
        communication_channel TEXT,
        requested_amount TEXT,
        author_name TEXT,
        tags TEXT,
        upvotes INTEGER DEFAULT 0,
        flagged INTEGER DEFAULT 0,
        risk_level TEXT,
        created_at TEXT,
        verified_report INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        sector TEXT DEFAULT 'Engineering'
    )
    """)

    # Scan History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scan_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        content_type TEXT,
        input_text TEXT,
        risk_score INTEGER,
        risk_level TEXT,
        title TEXT,
        summary TEXT,
        company_detected TEXT,
        red_flags TEXT,
        green_flags TEXT,
        action_advice TEXT,
        extracted_metadata TEXT,
        created_at TEXT,
        share_anonymously INTEGER DEFAULT 1
    )
    """)

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT,
        major TEXT,
        interests TEXT,
        followed_sectors TEXT,
        location TEXT,
        bio TEXT,
        avatar_color TEXT,
        is_mentor INTEGER DEFAULT 0,
        mentor_expertise TEXT,
        mentor_availability TEXT
    )
    """)

    # Persistent Chat Messages Table (Per User)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # Real-Time Notifications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link_tab TEXT NOT NULL,
        link_id TEXT,
        read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        severity TEXT DEFAULT 'danger'
    )
    """)

    # Connections Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        status TEXT NOT NULL, -- 'pending', 'accepted', 'declined'
        created_at TEXT NOT NULL
    )
    """)

    # Mentor Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mentor_sessions (
        id TEXT PRIMARY KEY,
        mentor_id TEXT NOT NULL,
        mentee_id TEXT NOT NULL,
        date_time TEXT NOT NULL,
        topic TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed'
        created_at TEXT NOT NULL
    )
    """)

    # Direct 1-on-1 Human Messages (Mentors <-> Connected Users Only)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS direct_messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()

    # Populate Seed Data if empty
    cursor.execute("SELECT COUNT(*) as count FROM opportunities")
    if cursor.fetchone()["count"] == 0:
        for opp in SEED_OPPORTUNITIES:
            cursor.execute("""
            INSERT INTO opportunities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                opp["id"], opp["title"], opp["company"], opp["company_logo"],
                opp["location"], opp["work_type"], opp["role_category"],
                opp["stipend"], opp["description"], json.dumps(opp["requirements"]),
                opp["trust_score"], opp["trust_level"], json.dumps(opp["trust_reasons"]),
                opp["source_url"], opp["source_platform"], opp["posted_date"],
                1 if opp["verified_badge"] else 0
            ))

    cursor.execute("SELECT COUNT(*) as count FROM forum_posts")
    if cursor.fetchone()["count"] == 0:
        for post in SEED_FORUM_POSTS:
            cursor.execute("""
            INSERT INTO forum_posts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                post["id"], post["company_name"], post["opportunity_title"],
                post["category"], post["summary"], post["detailed_experience"],
                post["communication_channel"], post["requested_amount"],
                post["author_name"], json.dumps(post["tags"]), post["upvotes"],
                1 if post["flagged"] else 0, post["risk_level"], post["created_at"],
                1 if post["verified_report"] else 0, post["comments_count"],
                "Engineering"
            ))

    # Seed Default Profiles for Multi-Account Testing
    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()["count"] == 0:
        seed_users = [
            (
                "alex_rivera", "Alex Rivera", "Computer Science",
                json.dumps(["Software Engineering", "AI/ML", "Distributed Systems"]),
                json.dumps(["Engineering", "Data"]),
                "San Francisco, CA",
                "Junior CS major at UC Berkeley. Passionate about cloud infra and security.",
                "#8B5CF6", 0, None, None
            ),
            (
                "marcus_vance", "Dr. Marcus Vance", "AI & Distributed Systems",
                json.dumps(["Machine Learning", "System Design", "Career Mentorship"]),
                json.dumps(["Engineering", "Data"]),
                "Mountain View, CA",
                "Staff AI Research Scientist @ DeepMind (Ex-Google). Happy to guide students on technical interviews and ML research careers.",
                "#10B981", 1, "AI/ML Research, System Design, Big Tech Interviews",
                "Available 2 slots/week (Fridays & Saturdays)"
            ),
            (
                "sarah_chen", "Sarah Chen", "Product Design & HCI",
                json.dumps(["UI/UX", "Design Systems", "Portfolio Reviews"]),
                json.dumps(["Design"]),
                "Sydney / Remote",
                "Senior Design Lead @ Canva. Helping student designers build standout portfolios and avoid unpaid design spec work.",
                "#EC4899", 1, "UX Portfolio Audits, Design Token Systems, Figma Mastery",
                "Available Tuesdays 4pm - 6pm EST"
            ),
            (
                "priya_sharma", "Priya Sharma", "Data Science & Finance",
                json.dumps(["Data Analytics", "Quantitative Finance", "Python"]),
                json.dumps(["Data", "Finance"]),
                "Austin, TX",
                "Senior Data Science student at UT Austin. Looking for verified summer 2026 data roles.",
                "#06B6D4", 0, None, None
            )
        ]
        for u in seed_users:
            cursor.execute("INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", u)

        # Pre-seed initial sample notification for Alex
        cursor.execute("""
        INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "notif_seed_01", "alex_rivera", "⚠️ New Scam Alert in Engineering",
            "Apex Digital Global (impersonating Amazon) was reported for WhatsApp commission task scams.",
            "forum", "post_scam_001", 0, "10 mins ago", "danger"
        ))

    conn.commit()
    conn.close()

# --- CHAT PERSISTENCE HELPERS ---
def save_chat_message(user_id: str, role: str, content: str) -> ChatMessageRecord:
    conn = get_db_connection()
    cursor = conn.cursor()
    msg_id = f"msg_{uuid.uuid4().hex[:8]}"
    created_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    cursor.execute("""
    INSERT INTO chat_messages VALUES (?, ?, ?, ?, ?)
    """, (msg_id, user_id, role, content, created_at))
    conn.commit()
    conn.close()
    return ChatMessageRecord(id=msg_id, user_id=user_id, role=role, content=content, created_at=created_at)

def get_chat_history(user_id: str) -> List[ChatMessageRecord]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
        ChatMessageRecord(
            id=r["id"],
            user_id=r["user_id"],
            role=r["role"],
            content=r["content"],
            created_at=r["created_at"]
        ) for r in rows
    ]

def clear_chat_history(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_messages WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()

# --- NOTIFICATIONS HELPERS ---
def create_notification(user_id: str, title: str, message: str, link_tab: str, link_id: Optional[str] = None, severity: str = "danger") -> NotificationItem:
    conn = get_db_connection()
    cursor = conn.cursor()
    notif_id = f"notif_{uuid.uuid4().hex[:8]}"
    created_at = "Just now"
    cursor.execute("""
    INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (notif_id, user_id, title, message, link_tab, link_id, 0, created_at, severity))
    conn.commit()
    conn.close()
    return NotificationItem(
        id=notif_id, user_id=user_id, title=title, message=message,
        link_tab=link_tab, link_id=link_id, read=False, created_at=created_at, severity=severity
    )

def broadcast_sector_alert(sector: str, title: str, message: str, link_tab: str, link_id: Optional[str] = None, severity: str = "danger") -> List[NotificationItem]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, followed_sectors FROM users")
    rows = cursor.fetchall()
    conn.close()
    created_notifs = []
    for r in rows:
        sectors = json.loads(r["followed_sectors"] or "[]")
        if sector.lower() in [s.lower() for s in sectors] or not sectors:
            notif = create_notification(r["user_id"], title, message, link_tab, link_id, severity)
            created_notifs.append(notif)
    return created_notifs

def get_user_notifications(user_id: str) -> List[NotificationItem]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 20", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
        NotificationItem(
            id=r["id"], user_id=r["user_id"], title=r["title"], message=r["message"],
            link_tab=r["link_tab"], link_id=r["link_id"], read=bool(r["read"]),
            created_at=r["created_at"], severity=r["severity"]
        ) for r in rows
    ]

def mark_notification_read(notif_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET read = 1 WHERE id = ?", (notif_id,))
    conn.commit()
    conn.close()

def mark_all_notifications_read(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET read = 1 WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()

# --- USERS & MENTORS HELPERS ---
def list_users(sector: Optional[str] = None, only_mentors: bool = False, search: Optional[str] = None) -> List[UserProfile]:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM users WHERE 1=1"
    params = []
    if only_mentors:
        query += " AND is_mentor = 1"
    if search:
        query += " AND (name LIKE ? OR major LIKE ? OR mentor_expertise LIKE ? OR bio LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%", f"%{search}%"])
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        sectors = json.loads(r["followed_sectors"] or "[]")
        if sector and sector.lower() != "all" and sector.lower() not in [s.lower() for s in sectors]:
            continue
        result.append(UserProfile(
            user_id=r["user_id"],
            name=r["name"],
            major=r["major"],
            interests=json.loads(r["interests"] or "[]"),
            followed_sectors=sectors,
            location=r["location"],
            bio=r["bio"],
            avatar_color=r["avatar_color"] or "#8B5CF6",
            is_mentor=bool(r["is_mentor"]),
            mentor_expertise=r["mentor_expertise"],
            mentor_availability=r["mentor_availability"]
        ))
    return result

def get_user_profile(user_id: str) -> Optional[UserProfile]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return UserProfile(
            user_id=row["user_id"],
            name=row["name"],
            major=row["major"],
            interests=json.loads(row["interests"] or "[]"),
            followed_sectors=json.loads(row["followed_sectors"] or "[]"),
            location=row["location"],
            bio=row["bio"],
            avatar_color=row["avatar_color"] or "#8B5CF6",
            is_mentor=bool(row["is_mentor"]),
            mentor_expertise=row["mentor_expertise"],
            mentor_availability=row["mentor_availability"]
        )
    return None

def update_user_profile(profile: UserProfile):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        profile.user_id, profile.name, profile.major,
        json.dumps(profile.interests), json.dumps(profile.followed_sectors),
        profile.location, profile.bio, profile.avatar_color or "#8B5CF6",
        1 if profile.is_mentor else 0, profile.mentor_expertise, profile.mentor_availability
    ))
    conn.commit()
    conn.close()

# --- CONNECTIONS HELPERS ---
def send_connection_request(sender_id: str, receiver_id: str) -> ConnectionItem:
    conn = get_db_connection()
    cursor = conn.cursor()
    # Check if a connection already exists between these two users
    cursor.execute("""
        SELECT * FROM connections
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    """, (sender_id, receiver_id, receiver_id, sender_id))
    existing = cursor.fetchone()
    if existing:
        existing_status = existing["status"]
        # Allow re-requesting after a declined connection — delete the stale row
        if existing_status == "declined":
            cursor.execute("DELETE FROM connections WHERE id = ?", (existing["id"],))
            conn.commit()
        else:
            # Return the existing pending/accepted connection as-is
            conn.close()
            return ConnectionItem(
                id=existing["id"],
                sender_id=existing["sender_id"],
                receiver_id=existing["receiver_id"],
                status=existing["status"],
                created_at=existing["created_at"]
            )

    conn_id = f"conn_{uuid.uuid4().hex[:8]}"
    created_at = "Just now"
    cursor.execute("""
    INSERT INTO connections VALUES (?, ?, ?, ?, ?)
    """, (conn_id, sender_id, receiver_id, "pending", created_at))
    conn.commit()
    conn.close()

    # Create real-time notification for receiver
    sender_prof = get_user_profile(sender_id)
    sender_name = sender_prof.name if sender_prof else "A student"
    notif = create_notification(
        user_id=receiver_id,
        title="🤝 New Connection Request",
        message=f"{sender_name} sent you a connection request.",
        link_tab="mentors",
        link_id=conn_id,
        severity="info"
    )

    return ConnectionItem(
        id=conn_id, sender_id=sender_id, receiver_id=receiver_id,
        status="pending", created_at=created_at
    )

def respond_connection_request(conn_id: str, status: str) -> Optional[ConnectionItem]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE connections SET status = ? WHERE id = ?", (status, conn_id))
    conn.commit()
    cursor.execute("SELECT * FROM connections WHERE id = ?", (conn_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        if status == "accepted":
            sender_prof = get_user_profile(row["receiver_id"])
            receiver_prof = get_user_profile(row["sender_id"])
            if sender_prof and receiver_prof:
                create_notification(
                    user_id=row["sender_id"],
                    title="🎉 Connection Accepted!",
                    message=f"{sender_prof.name} accepted your connection request. You can now direct message!",
                    link_tab="mentors",
                    link_id=conn_id,
                    severity="success"
                )
        return ConnectionItem(
            id=row["id"], sender_id=row["sender_id"], receiver_id=row["receiver_id"],
            status=row["status"], created_at=row["created_at"]
        )
    return None

def delete_connection(conn_id: str) -> bool:
    """Remove a connection row entirely, resetting the state so a fresh request can be sent later."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM connections WHERE id = ?", (conn_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def get_user_connections(user_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM connections 
    WHERE (sender_id = ? OR receiver_id = ?)
    ORDER BY created_at DESC
    """, (user_id, user_id))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        other_id = r["receiver_id"] if r["sender_id"] == user_id else r["sender_id"]
        other_prof = get_user_profile(other_id)
        results.append({
            "id": r["id"],
            "sender_id": r["sender_id"],
            "receiver_id": r["receiver_id"],
            "status": r["status"],
            "created_at": r["created_at"],
            "is_incoming": r["receiver_id"] == user_id and r["status"] == "pending",
            "other_user": other_prof.dict() if other_prof else None
        })
    return results

def is_connected(user_a: str, user_b: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT COUNT(*) as count FROM connections
    WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
    AND status = 'accepted'
    """, (user_a, user_b, user_b, user_a))
    res = cursor.fetchone()["count"] > 0
    conn.close()
    return res

# --- MENTOR SESSIONS HELPERS ---
def create_mentor_session(mentor_id: str, mentee_id: str, date_time: str, topic: str, notes: str = "") -> MentorSession:
    conn = get_db_connection()
    cursor = conn.cursor()
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    created_at = "Just now"
    cursor.execute("""
    INSERT INTO mentor_sessions VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (session_id, mentor_id, mentee_id, date_time, topic, notes, "pending", created_at))
    conn.commit()
    conn.close()

    mentee_prof = get_user_profile(mentee_id)
    create_notification(
        user_id=mentor_id,
        title="📅 New Mentorship Session Request",
        message=f"{mentee_prof.name if mentee_prof else 'A mentee'} requested a session: '{topic}' on {date_time}",
        link_tab="mentors",
        link_id=session_id,
        severity="info"
    )

    return MentorSession(
        id=session_id, mentor_id=mentor_id, mentee_id=mentee_id,
        date_time=date_time, topic=topic, notes=notes, status="pending", created_at=created_at
    )

def confirm_mentor_session(session_id: str) -> Optional[MentorSession]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE mentor_sessions SET status = 'confirmed' WHERE id = ?", (session_id,))
    conn.commit()
    cursor.execute("SELECT * FROM mentor_sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        mentor_prof = get_user_profile(row["mentor_id"])
        create_notification(
            user_id=row["mentee_id"],
            title="✅ Mentorship Session Confirmed!",
            message=f"{mentor_prof.name if mentor_prof else 'Mentor'} confirmed your session on {row['date_time']}.",
            link_tab="mentors",
            link_id=session_id,
            severity="success"
        )
        return MentorSession(
            id=row["id"], mentor_id=row["mentor_id"], mentee_id=row["mentee_id"],
            date_time=row["date_time"], topic=row["topic"], notes=row["notes"],
            status=row["status"], created_at=row["created_at"]
        )
    return None

def get_user_sessions(user_id: str) -> List[MentorSession]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM mentor_sessions 
    WHERE mentor_id = ? OR mentee_id = ?
    ORDER BY created_at DESC
    """, (user_id, user_id))
    rows = cursor.fetchall()
    conn.close()
    sessions = []
    for r in rows:
        mentor_prof = get_user_profile(r["mentor_id"])
        mentee_prof = get_user_profile(r["mentee_id"])
        sessions.append(MentorSession(
            id=r["id"],
            mentor_id=r["mentor_id"],
            mentee_id=r["mentee_id"],
            mentor_name=mentor_prof.name if mentor_prof else "Mentor",
            mentee_name=mentee_prof.name if mentee_prof else "Mentee",
            date_time=r["date_time"],
            topic=r["topic"],
            notes=r["notes"],
            status=r["status"],
            created_at=r["created_at"]
        ))
    return sessions

# --- DIRECT 1-ON-1 MESSAGING (Mentors Only) ---
def send_direct_message(sender_id: str, receiver_id: str, message: str) -> DirectMessage:
    # Verify connection & mentor requirement
    sender_prof = get_user_profile(sender_id)
    receiver_prof = get_user_profile(receiver_id)
    
    if not (sender_prof and receiver_prof):
        raise ValueError("Invalid users")
    
    # Must be connected
    if not is_connected(sender_id, receiver_id):
        raise ValueError("Direct messages require an accepted connection.")
    
    # One of the two must be a mentor
    if not (sender_prof.is_mentor or receiver_prof.is_mentor):
        raise ValueError("Direct 1-on-1 messages are only enabled between mentees and registered mentors.")

    conn = get_db_connection()
    cursor = conn.cursor()
    msg_id = f"dm_{uuid.uuid4().hex[:8]}"
    created_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    cursor.execute("""
    INSERT INTO direct_messages VALUES (?, ?, ?, ?, ?)
    """, (msg_id, sender_id, receiver_id, message, created_at))
    conn.commit()
    conn.close()

    # Create real-time notification
    create_notification(
        user_id=receiver_id,
        title=f"💬 New Message from {sender_prof.name}",
        message=f"{message[:70]}...",
        link_tab="mentors",
        link_id=sender_id,
        severity="info"
    )

    return DirectMessage(
        id=msg_id, sender_id=sender_id, receiver_id=receiver_id,
        sender_name=sender_prof.name, message=message, created_at=created_at
    )

def get_direct_message_thread(user_a: str, user_b: str) -> List[DirectMessage]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM direct_messages 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
    """, (user_a, user_b, user_b, user_a))
    rows = cursor.fetchall()
    conn.close()
    
    user_a_prof = get_user_profile(user_a)
    user_b_prof = get_user_profile(user_b)
    name_map = {
        user_a: user_a_prof.name if user_a_prof else user_a,
        user_b: user_b_prof.name if user_b_prof else user_b
    }

    return [
        DirectMessage(
            id=r["id"],
            sender_id=r["sender_id"],
            receiver_id=r["receiver_id"],
            sender_name=name_map.get(r["sender_id"], "User"),
            message=r["message"],
            created_at=r["created_at"]
        ) for r in rows
    ]

# Other standard queries
def list_opportunities(category: Optional[str] = None, search: Optional[str] = None, work_type: Optional[str] = None) -> List[Opportunity]:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM opportunities WHERE 1=1"
    params = []
    if category and category.lower() != "all":
        query += " AND role_category = ?"
        params.append(category)
    if work_type and work_type.lower() != "all":
        query += " AND work_type = ?"
        params.append(work_type)
    if search:
        query += " AND (title LIKE ? OR company LIKE ? OR description LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    query += " ORDER BY trust_score DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [
        Opportunity(
            id=r["id"], title=r["title"], company=r["company"], company_logo=r["company_logo"],
            location=r["location"], work_type=r["work_type"], role_category=r["role_category"],
            stipend=r["stipend"], description=r["description"],
            requirements=json.loads(r["requirements"] or "[]"),
            trust_score=r["trust_score"], trust_level=RiskLevel(r["trust_level"]),
            trust_reasons=json.loads(r["trust_reasons"] or "[]"),
            source_url=r["source_url"], source_platform=r["source_platform"],
            posted_date=r["posted_date"], verified_badge=bool(r["verified_badge"])
        ) for r in rows
    ]

def list_forum_posts(search: Optional[str] = None, tag: Optional[str] = None) -> List[ForumPost]:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM forum_posts WHERE flagged = 0"
    params = []
    if search:
        query += " AND (company_name LIKE ? OR opportunity_title LIKE ? OR summary LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    query += " ORDER BY upvotes DESC, created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        tags = json.loads(r["tags"] or "[]")
        if tag and tag.lower() != "all" and tag.lower() not in [t.lower() for t in tags]:
            continue
        result.append(ForumPost(
            id=r["id"], company_name=r["company_name"], opportunity_title=r["opportunity_title"],
            category=r["category"], summary=r["summary"], detailed_experience=r["detailed_experience"],
            communication_channel=r["communication_channel"], requested_amount=r["requested_amount"],
            author_name=r["author_name"], tags=tags, upvotes=r["upvotes"],
            flagged=bool(r["flagged"]), risk_level=RiskLevel(r["risk_level"]),
            created_at=r["created_at"], verified_report=bool(r["verified_report"]),
            comments_count=r["comments_count"], sector=r["sector"] or "Engineering"
        ))
    return result

def create_forum_post(post: ForumPost) -> ForumPost:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO forum_posts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        post.id, post.company_name, post.opportunity_title, post.category,
        post.summary, post.detailed_experience, post.communication_channel,
        post.requested_amount, post.author_name, json.dumps(post.tags),
        post.upvotes, 1 if post.flagged else 0, post.risk_level.value,
        post.created_at, 1 if post.verified_report else 0, post.comments_count,
        post.sector or "Engineering"
    ))
    conn.commit()
    conn.close()
    return post

def upvote_forum_post(post_id: str) -> Optional[int]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE forum_posts SET upvotes = upvotes + 1 WHERE id = ?", (post_id,))
    conn.commit()
    cursor.execute("SELECT upvotes FROM forum_posts WHERE id = ?", (post_id,))
    row = cursor.fetchone()
    conn.close()
    return row["upvotes"] if row else None

def save_scan_result(scan: ScanResponse, content_type: str, input_text: str, user_id: str = "alex_rivera", share_anonymously: bool = True):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO scan_history VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        scan.id, user_id, content_type, input_text[:500], scan.risk_score,
        scan.risk_level.value, scan.title, scan.summary, scan.company_detected,
        json.dumps([f.dict() for f in scan.red_flags]),
        json.dumps([f.dict() for f in scan.green_flags]),
        json.dumps(scan.action_advice),
        json.dumps(scan.extracted_metadata),
        scan.created_at, 1 if share_anonymously else 0
    ))
    conn.commit()
    conn.close()

def get_recent_scans(user_id: str = "alex_rivera", limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scan_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", (user_id, limit))
    rows = cursor.fetchall()
    conn.close()
    return [{
        "id": r["id"], "risk_score": r["risk_score"], "risk_level": r["risk_level"],
        "title": r["title"], "summary": r["summary"], "company_detected": r["company_detected"],
        "red_flags": json.loads(r["red_flags"] or "[]"),
        "green_flags": json.loads(r["green_flags"] or "[]"),
        "action_advice": json.loads(r["action_advice"] or "[]"),
        "created_at": r["created_at"]
    } for r in rows]

def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM scan_history")
    total_scans = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM scan_history WHERE risk_score >= 70")
    scams_prevented = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM opportunities")
    verified_listings = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM forum_posts")
    forum_reports = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE is_mentor = 1")
    active_mentors = cursor.fetchone()["count"]
    conn.close()
    return {
        "total_scans": total_scans + 1420,
        "scams_prevented": scams_prevented + 892,
        "verified_listings": verified_listings,
        "community_reports": forum_reports + 310,
        "active_mentors": active_mentors + 8,
        "community_accuracy": "99.4%"
    }
