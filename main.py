import os
import uuid
import json
import asyncio
from typing import List, Optional, Dict, Set
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

from backend.models import (
    ScanRequest, ScanResponse, Opportunity, ForumPostCreate,
    ForumPost, ChatRequest, ChatResponse, UserProfile, RiskLevel,
    ScanType, ChatMessageRecord, NotificationItem, MentorRegisterRequest,
    ConnectionRequest, ConnectionItem, MentorSessionRequest, MentorSession,
    DirectMessageCreate, DirectMessage
)
from backend.database import (
    init_db, list_opportunities, list_forum_posts,
    create_forum_post, upvote_forum_post, save_scan_result,
    get_recent_scans, get_user_profile, update_user_profile, get_stats,
    save_chat_message, get_chat_history, clear_chat_history,
    create_notification, broadcast_sector_alert, get_user_notifications,
    mark_notification_read, mark_all_notifications_read,
    list_users, send_connection_request, respond_connection_request,
    get_user_connections, delete_connection, create_mentor_session,
    confirm_mentor_session, get_user_sessions, send_direct_message,
    get_direct_message_thread
)
from backend.scanner_engine import analyze_opportunity_content
from backend.career_ai import process_career_chat
from backend.seed_data import VERIFIED_COMPANIES

# Initialize database on startup
init_db()

app = FastAPI(
    title="ScamX API Server",
    description="Backend for ScamX dual-surface student opportunity verification platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

# In-memory notification queues for live SSE subscribers
notification_subscribers: Dict[str, Set[asyncio.Queue]] = {}

def push_live_notification(user_id: str, notif: NotificationItem):
    if user_id in notification_subscribers:
        for q in list(notification_subscribers[user_id]):
            try:
                q.put_nowait(notif)
            except Exception:
                pass

def broadcast_live_notification(notifs: List[NotificationItem]):
    for notif in notifs:
        push_live_notification(notif.user_id, notif)

@app.get("/")
def read_root():
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "ScamX API is running. Visit /docs for OpenAPI documentation."}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ScamX API", "version": "2.0.0"}

@app.get("/api/stats")
def fetch_stats():
    return get_stats()

# --- REAL-TIME SSE NOTIFICATION STREAM ---
@app.get("/api/notifications/stream")
async def notifications_stream(request: Request, user_id: str = "alex_rivera"):
    queue = asyncio.Queue()
    if user_id not in notification_subscribers:
        notification_subscribers[user_id] = set()
    notification_subscribers[user_id].add(queue)

    async def event_generator():
        try:
            # Send initial keepalive
            yield f"event: connected\ndata: {json.dumps({'user_id': user_id})}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    notif = await asyncio.wait_for(queue.get(), timeout=20.0)
                    yield f"event: notification\ndata: {json.dumps(notif.dict())}\n\n"
                except asyncio.TimeoutError:
                    # Keepalive ping
                    yield f": ping\n\n"
        finally:
            notification_subscribers[user_id].discard(queue)
            if not notification_subscribers[user_id]:
                del notification_subscribers[user_id]

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/notifications", response_model=List[NotificationItem])
def fetch_user_notifications(user_id: str = "alex_rivera"):
    return get_user_notifications(user_id)

@app.post("/api/notifications/{notif_id}/read")
def read_notification(notif_id: str):
    mark_notification_read(notif_id)
    return {"status": "ok", "id": notif_id}

@app.post("/api/notifications/read-all")
def read_all_notifications(user_id: str = "alex_rivera"):
    mark_all_notifications_read(user_id)
    return {"status": "ok"}

# --- SCANNER ENDPOINTS ---
@app.post("/api/scan", response_model=ScanResponse)
def scan_opportunity(req: ScanRequest):
    result = analyze_opportunity_content(req)
    user_id = req.user_id or "alex_rivera"
    save_scan_result(
        scan=result,
        content_type=req.content_type.value,
        input_text=req.text or req.url or "Uploaded Image/Screenshot",
        user_id=user_id,
        share_anonymously=req.share_anonymously
    )

    # If yellow or red risk, broadcast real-time notification to interested users
    if result.risk_score >= 30:
        severity = "danger" if result.risk_score >= 70 else "warning"
        title = f"⚠️ High-Risk Scam Alert ({result.risk_score}/100)" if result.risk_score >= 70 else f"⚠️ Caution Alert ({result.risk_score}/100)"
        sector = "Engineering"
        if result.company_detected and "Canva" in result.company_detected:
            sector = "Design"
        
        notifs = broadcast_sector_alert(
            sector=sector,
            title=title,
            message=f"{result.company_detected or 'Opportunity'}: {result.summary[:100]}",
            link_tab="scanner",
            link_id=result.id,
            severity=severity
        )
        broadcast_live_notification(notifs)

    return result

@app.post("/api/scan/upload")
async def scan_file_upload(
    file: UploadFile = File(...),
    share_anonymously: bool = Form(True),
    user_id: str = Form("alex_rivera")
):
    contents = await file.read()
    import base64
    b64_encoded = base64.b64encode(contents).decode("utf-8")
    req = ScanRequest(
        content_type=ScanType.IMAGE,
        image_base64=b64_encoded,
        file_name=file.filename,
        share_anonymously=share_anonymously,
        user_id=user_id
    )
    result = analyze_opportunity_content(req)
    save_scan_result(
        scan=result,
        content_type="image",
        input_text=f"Uploaded Screenshot: {file.filename}",
        user_id=user_id,
        share_anonymously=share_anonymously
    )
    return result

@app.get("/api/scans/recent")
def fetch_recent_scans(user_id: str = "alex_rivera"):
    return get_recent_scans(user_id=user_id)

# --- OPPORTUNITIES FEED ENDPOINTS ---
@app.get("/api/opportunities", response_model=List[Opportunity])
def fetch_opportunities(
    category: Optional[str] = None,
    search: Optional[str] = None,
    work_type: Optional[str] = None
):
    return list_opportunities(category=category, search=search, work_type=work_type)

# --- FORUM ENDPOINTS ---
@app.get("/api/forum", response_model=List[ForumPost])
def fetch_forum_posts(search: Optional[str] = None, tag: Optional[str] = None):
    return list_forum_posts(search=search, tag=tag)

@app.post("/api/forum", response_model=ForumPost)
def submit_forum_post(create_req: ForumPostCreate):
    risk_level = RiskLevel.HIGH_RISK
    if create_req.category == "legit_experience":
        risk_level = RiskLevel.SAFE
    elif create_req.category == "caution_warning":
        risk_level = RiskLevel.CAUTION

    post_id = f"post_{uuid.uuid4().hex[:8]}"
    new_post = ForumPost(
        id=post_id,
        company_name=create_req.company_name,
        opportunity_title=create_req.opportunity_title,
        category=create_req.category,
        summary=create_req.summary,
        detailed_experience=create_req.detailed_experience,
        communication_channel=create_req.communication_channel or "WhatsApp",
        requested_amount=create_req.requested_amount,
        author_name=create_req.author_name or "Anonymous Student",
        tags=create_req.tags or [create_req.category.replace("_", " ")],
        upvotes=1,
        flagged=False,
        risk_level=risk_level,
        created_at="Just now",
        verified_report=True,
        comments_count=0,
        sector=create_req.sector or "Engineering"
    )
    saved = create_forum_post(new_post)

    # Trigger real-time broadcast notification to users following this sector
    if risk_level != RiskLevel.SAFE:
        notifs = broadcast_sector_alert(
            sector=new_post.sector,
            title=f"🚨 New Peer Scam Report: {new_post.company_name}",
            message=f"{new_post.summary[:110]}",
            link_tab="forum",
            link_id=saved.id,
            severity="danger"
        )
        broadcast_live_notification(notifs)

    return saved

@app.post("/api/forum/{post_id}/upvote")
def upvote_post(post_id: str):
    new_count = upvote_forum_post(post_id)
    if new_count is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"id": post_id, "upvotes": new_count}

# --- PERSISTENT AI CAREER CHATBOT ENDPOINTS ---
@app.get("/api/chat/history", response_model=List[ChatMessageRecord])
def fetch_chat_history(user_id: str = "alex_rivera"):
    return get_chat_history(user_id)

@app.delete("/api/chat/history")
def reset_chat_history(user_id: str = "alex_rivera"):
    clear_chat_history(user_id)
    return {"status": "cleared", "user_id": user_id}

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_career_ai(req: ChatRequest):
    user_id = req.user_id or "alex_rivera"
    # Save user message to persistent DB
    save_chat_message(user_id=user_id, role="user", content=req.message)

    # Generate assistant response
    res = process_career_chat(req)

    # Save assistant response to persistent DB
    save_chat_message(user_id=user_id, role="assistant", content=res.reply)

    return res

# --- USERS, PROFILES & MENTORS ENDPOINTS ---
@app.get("/api/users", response_model=List[UserProfile])
def fetch_users(sector: Optional[str] = None, search: Optional[str] = None):
    return list_users(sector=sector, only_mentors=False, search=search)

@app.get("/api/mentors", response_model=List[UserProfile])
def fetch_mentors(sector: Optional[str] = None, search: Optional[str] = None):
    return list_users(sector=sector, only_mentors=True, search=search)

@app.get("/api/users/{user_id}", response_model=UserProfile)
def fetch_user_by_id(user_id: str):
    prof = get_user_profile(user_id)
    if not prof:
        raise HTTPException(status_code=404, detail="User not found")
    return prof

@app.get("/api/user/profile", response_model=UserProfile)
def fetch_current_user_profile(user_id: str = "alex_rivera"):
    prof = get_user_profile(user_id)
    if not prof:
        return UserProfile(user_id=user_id, name="Student")
    return prof

@app.post("/api/user/profile", response_model=UserProfile)
def save_profile(profile: UserProfile):
    update_user_profile(profile)
    return profile

@app.post("/api/mentors/register", response_model=UserProfile)
def register_as_mentor(req: MentorRegisterRequest):
    prof = get_user_profile(req.user_id)
    if not prof:
        prof = UserProfile(user_id=req.user_id, name="Student Mentor")
    prof.is_mentor = True
    prof.mentor_expertise = req.expertise
    prof.mentor_availability = req.availability
    prof.followed_sectors = req.sectors
    if req.bio:
        prof.bio = req.bio
    update_user_profile(prof)
    return prof

# --- CONNECTIONS ENDPOINTS ---
@app.get("/api/connections")
def fetch_connections(user_id: str = "alex_rivera"):
    return get_user_connections(user_id)

@app.post("/api/connections/request", response_model=ConnectionItem)
def create_connection_request(req: ConnectionRequest):
    conn_item = send_connection_request(req.sender_id, req.receiver_id)
    # Push the live notification directly to the receiver's SSE stream.
    # The notification was created inside send_connection_request; we retrieve
    # the most recent one for that receiver (just created) and push it live.
    notifs = get_user_notifications(req.receiver_id)
    if notifs:
        # notifs are ordered by id DESC so the most-recent is first
        push_live_notification(req.receiver_id, notifs[0])
    return conn_item

@app.post("/api/connections/{conn_id}/respond", response_model=ConnectionItem)
def respond_to_connection(conn_id: str, status: str = Query(..., regex="^(accepted|declined)$")):
    res = respond_connection_request(conn_id, status)
    if not res:
        raise HTTPException(status_code=404, detail="Connection not found")
    if status == "accepted":
        # Notify the original sender that their request was accepted.
        notifs = get_user_notifications(res.sender_id)
        if notifs:
            push_live_notification(res.sender_id, notifs[0])
    return res

@app.delete("/api/connections/{conn_id}")
def remove_connection(conn_id: str):
    """Delete a connection entirely, resetting state so either party can request again."""
    deleted = delete_connection(conn_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connection not found")
    return {"status": "removed", "id": conn_id}

# --- MENTOR SESSIONS ENDPOINTS ---
@app.get("/api/sessions", response_model=List[MentorSession])
def fetch_sessions(user_id: str = "alex_rivera"):
    return get_user_sessions(user_id)

@app.post("/api/sessions/request", response_model=MentorSession)
def request_session(req: MentorSessionRequest):
    sess = create_mentor_session(
        mentor_id=req.mentor_id,
        mentee_id=req.mentee_id,
        date_time=req.date_time,
        topic=req.topic,
        notes=req.notes or ""
    )
    # Notify the mentor live — the notification was just created inside create_mentor_session
    notifs = get_user_notifications(req.mentor_id)
    if notifs:
        push_live_notification(req.mentor_id, notifs[0])
    return sess

@app.post("/api/sessions/{session_id}/confirm", response_model=MentorSession)
def confirm_session(session_id: str):
    sess = confirm_mentor_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    # Notify the mentee live that their session is confirmed
    notifs = get_user_notifications(sess.mentee_id)
    if notifs:
        push_live_notification(sess.mentee_id, notifs[0])
    return sess

# --- DIRECT 1-ON-1 MESSAGING (Mentors Only) ---
@app.get("/api/direct-messages", response_model=List[DirectMessage])
def fetch_direct_messages(user_a: str, user_b: str):
    return get_direct_message_thread(user_a, user_b)

@app.post("/api/direct-messages", response_model=DirectMessage)
def send_dm(req: DirectMessageCreate):
    try:
        dm = send_direct_message(req.sender_id, req.receiver_id, req.message)
        # Push the new-message notification directly to the receiver's SSE stream
        notifs = get_user_notifications(req.receiver_id)
        if notifs:
            push_live_notification(req.receiver_id, notifs[0])
        return dm
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/companies")
def fetch_companies():
    return VERIFIED_COMPANIES

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
