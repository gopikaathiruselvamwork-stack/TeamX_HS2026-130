from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    SAFE = "SAFE"            # Low risk (0 - 29) -> Green
    CAUTION = "CAUTION"      # Moderate risk (30 - 69) -> Amber
    HIGH_RISK = "HIGH_RISK"  # Severe risk (70 - 100) -> Red

class ScanType(str, Enum):
    TEXT = "text"
    URL = "url"
    IMAGE = "image"
    QR = "qr"

class FlagDetail(BaseModel):
    title: str
    description: str
    severity: str # "high", "medium", "low", "positive"
    icon: Optional[str] = None

class ScanRequest(BaseModel):
    content_type: ScanType = ScanType.TEXT
    text: Optional[str] = ""
    url: Optional[str] = ""
    image_base64: Optional[str] = None
    file_name: Optional[str] = None
    share_anonymously: bool = True
    user_id: Optional[str] = "alex_rivera"

class ScanResponse(BaseModel):
    id: str
    risk_score: int = Field(..., ge=0, le=100, description="Risk score from 0 (Safe) to 100 (Critical Scam)")
    risk_level: RiskLevel
    title: str
    summary: str
    company_detected: Optional[str] = None
    is_known_company: bool = False
    verified_company: bool = False
    red_flags: List[FlagDetail] = []
    green_flags: List[FlagDetail] = []
    action_advice: List[str] = []
    extracted_metadata: Dict[str, Any] = {}
    created_at: str

class Opportunity(BaseModel):
    id: str
    title: str
    company: str
    company_logo: Optional[str] = None
    location: str
    work_type: str # "Remote", "Hybrid", "On-site"
    role_category: str # "Engineering", "Design", "Marketing", "Data", "Finance"
    stipend: str
    description: str
    requirements: List[str] = []
    trust_score: int # 0 - 100
    trust_level: RiskLevel
    trust_reasons: List[str] = []
    source_url: str
    source_platform: str # "LinkedIn", "Official Careers", "Wellfound", "Y Combinator"
    posted_date: str
    verified_badge: bool = True

class ForumPostCreate(BaseModel):
    company_name: str
    opportunity_title: str
    category: str # "fake_stipend", "advance_fee", "telegram_interview", "fake_offer_letter", "task_scam", "legit_experience"
    summary: str
    detailed_experience: str
    communication_channel: Optional[str] = "WhatsApp" # "WhatsApp", "Telegram", "Email", "Instagram", "LinkedIn"
    requested_amount: Optional[str] = "$0"
    author_name: Optional[str] = "Anonymous Student"
    tags: List[str] = []
    sector: Optional[str] = "Engineering"

class ForumPost(BaseModel):
    id: str
    company_name: str
    opportunity_title: str
    category: str
    summary: str
    detailed_experience: str
    communication_channel: str
    requested_amount: Optional[str] = None
    author_name: str
    tags: List[str] = []
    upvotes: int = 0
    flagged: bool = False
    risk_level: RiskLevel
    created_at: str
    verified_report: bool = False
    comments_count: int = 0
    sector: str = "Engineering"

# --- CHATBOT MODELS ---
class ChatMessageRecord(BaseModel):
    id: Optional[str] = None
    user_id: str
    role: str # "user" or "assistant"
    content: str
    created_at: str

class ChatRequest(BaseModel):
    message: str
    user_id: str = "alex_rivera"
    session_id: Optional[str] = "default_session"
    referenced_scan_id: Optional[str] = None
    user_major: Optional[str] = "Computer Science"
    user_location: Optional[str] = "Global"

class ChatResponse(BaseModel):
    reply: str
    is_scam_inquiry: bool = False
    suggested_actions: List[str] = []
    referenced_company: Optional[str] = None
    verified_opportunities: Optional[List[Opportunity]] = None

# --- NOTIFICATIONS MODEL ---
class NotificationItem(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    link_tab: str # "scanner", "feed", "forum", "mentors"
    link_id: Optional[str] = None
    read: bool = False
    created_at: str
    severity: str = "danger" # "danger", "warning", "info", "success"

# --- USER & MENTOR MODELS ---
class UserProfile(BaseModel):
    user_id: str
    name: str
    major: str = "Computer Science"
    interests: List[str] = ["Software Engineering", "AI/ML"]
    followed_sectors: List[str] = ["Engineering", "Design", "Data"]
    location: str = "United States"
    bio: Optional[str] = "Aspiring software engineer passionate about scalable systems and safety."
    avatar_color: Optional[str] = "#8B5CF6"
    is_mentor: bool = False
    mentor_expertise: Optional[str] = None
    mentor_availability: Optional[str] = None

class MentorRegisterRequest(BaseModel):
    user_id: str
    expertise: str
    sectors: List[str]
    bio: str
    availability: str

class ConnectionRequest(BaseModel):
    sender_id: str
    receiver_id: str

class ConnectionItem(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    status: str # "pending", "accepted", "declined"
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None
    created_at: str

class MentorSessionRequest(BaseModel):
    mentor_id: str
    mentee_id: str
    date_time: str
    topic: str
    notes: Optional[str] = ""

class MentorSession(BaseModel):
    id: str
    mentor_id: str
    mentee_id: str
    mentor_name: Optional[str] = None
    mentee_name: Optional[str] = None
    date_time: str
    topic: str
    notes: Optional[str] = ""
    status: str # "pending", "confirmed", "completed"
    created_at: str

class DirectMessageCreate(BaseModel):
    sender_id: str
    receiver_id: str
    message: str

class DirectMessage(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    sender_name: Optional[str] = None
    message: str
    created_at: str
