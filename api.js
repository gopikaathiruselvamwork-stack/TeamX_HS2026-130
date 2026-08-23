/**
 * ScamX Frontend API Client
 * Connects directly to backend API with transparent error handling and fallback simulation.
 */

const API_BASE = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
  ? `${window.location.origin}/api`
  : "http://localhost:8000/api";

// Active logged-in user state
let currentUserId = localStorage.getItem("scamx_current_user_id") || "alex_rivera";

export const API = {
  getCurrentUserId() {
    return currentUserId;
  },

  setCurrentUserId(newUserId) {
    currentUserId = newUserId;
    localStorage.setItem("scamx_current_user_id", newUserId);
  },

  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return await res.json();
    } catch (e) {
      return {
        total_scans: 1428,
        scams_prevented: 894,
        verified_listings: 6,
        community_reports: 312,
        active_mentors: 8,
        community_accuracy: "99.4%"
      };
    }
  },

  async scanContent(payload) {
    const res = await fetch(`${API_BASE}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        user_id: currentUserId
      })
    });
    if (!res.ok) throw new Error("Scanning failed");
    return await res.json();
  },

  async uploadScanFile(file, shareAnonymously = true) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("share_anonymously", shareAnonymously);
    formData.append("user_id", currentUserId);

    const res = await fetch(`${API_BASE}/scan/upload`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("File upload scan failed");
    return await res.json();
  },

  async getRecentScans() {
    try {
      const res = await fetch(`${API_BASE}/scans/recent?user_id=${currentUserId}`);
      if (!res.ok) throw new Error("Failed to get recent scans");
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async getOpportunities(category = "all", search = "", workType = "all") {
    try {
      const params = new URLSearchParams();
      if (category && category !== "all") params.append("category", category);
      if (search) params.append("search", search);
      if (workType && workType !== "all") params.append("work_type", workType);
      
      const res = await fetch(`${API_BASE}/opportunities?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch opportunities");
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async getForumPosts(search = "", tag = "all") {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (tag && tag !== "all") params.append("tag", tag);

      const res = await fetch(`${API_BASE}/forum?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch forum posts");
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async submitForumPost(postData) {
    const res = await fetch(`${API_BASE}/forum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData)
    });
    if (!res.ok) throw new Error("Failed to submit forum post");
    return await res.json();
  },

  async upvoteForumPost(postId) {
    const res = await fetch(`${API_BASE}/forum/${postId}/upvote`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to upvote");
    return await res.json();
  },

  // --- PERSISTENT AI CAREER CHAT ---
  async getChatHistory() {
    try {
      const res = await fetch(`${API_BASE}/chat/history?user_id=${currentUserId}`);
      if (!res.ok) throw new Error("Failed to load chat history");
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async resetChatHistory() {
    const res = await fetch(`${API_BASE}/chat/history?user_id=${currentUserId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to reset chat history");
    return await res.json();
  },

  async sendChatMessage(message, sessionId = "default_session", referencedScanId = null) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        user_id: currentUserId,
        session_id: sessionId,
        referenced_scan_id: referencedScanId
      })
    });
    if (!res.ok) throw new Error("Chat request failed");
    return await res.json();
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    try {
      const res = await fetch(`${API_BASE}/notifications?user_id=${currentUserId}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async markNotificationRead(notifId) {
    const res = await fetch(`${API_BASE}/notifications/${notifId}/read`, {
      method: "POST"
    });
    return await res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all?user_id=${currentUserId}`, {
      method: "POST"
    });
    return await res.json();
  },

  // SSE Stream Listener
  subscribeToNotifications(onNotificationReceived) {
    const eventSource = new EventSource(`${API_BASE}/notifications/stream?user_id=${currentUserId}`);
    eventSource.addEventListener("notification", (event) => {
      try {
        const notifData = JSON.parse(event.data);
        onNotificationReceived(notifData);
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    });
    return eventSource;
  },

  // --- USER PROFILE & DIRECTORY ---
  async getUserProfile(userId = currentUserId) {
    try {
      const res = await fetch(`${API_BASE}/user/profile?user_id=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return await res.json();
    } catch (e) {
      return {
        user_id: userId,
        name: "Student",
        major: "Computer Science",
        interests: ["Software Engineering"],
        followed_sectors: ["Engineering"],
        location: "United States"
      };
    }
  },

  async saveUserProfile(profile) {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error("Failed to save profile");
    return await res.json();
  },

  async getUsers(sector = "all", search = "") {
    const params = new URLSearchParams();
    if (sector && sector !== "all") params.append("sector", sector);
    if (search) params.append("search", search);
    const res = await fetch(`${API_BASE}/users?${params.toString()}`);
    return await res.json();
  },

  async getMentors(sector = "all", search = "") {
    const params = new URLSearchParams();
    if (sector && sector !== "all") params.append("sector", sector);
    if (search) params.append("search", search);
    const res = await fetch(`${API_BASE}/mentors?${params.toString()}`);
    return await res.json();
  },

  async registerAsMentor(data) {
    const res = await fetch(`${API_BASE}/mentors/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        user_id: currentUserId
      })
    });
    if (!res.ok) throw new Error("Failed to register mentor");
    return await res.json();
  },

  // --- CONNECTIONS ---
  async getConnections() {
    const res = await fetch(`${API_BASE}/connections?user_id=${currentUserId}`);
    return await res.json();
  },

  async sendConnectionRequest(receiverId) {
    const res = await fetch(`${API_BASE}/connections/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: currentUserId,
        receiver_id: receiverId
      })
    });
    if (!res.ok) throw new Error("Connection request failed");
    return await res.json();
  },

  async respondConnection(connId, status) {
    const res = await fetch(`${API_BASE}/connections/${connId}/respond?status=${status}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Connection response failed");
    return await res.json();
  },

  async deleteConnection(connId) {
    const res = await fetch(`${API_BASE}/connections/${connId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to remove connection");
    return await res.json();
  },

  // --- SESSIONS ---
  async getSessions() {
    const res = await fetch(`${API_BASE}/sessions?user_id=${currentUserId}`);
    return await res.json();
  },

  async requestSession(mentorId, dateTime, topic, notes = "") {
    const res = await fetch(`${API_BASE}/sessions/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentor_id: mentorId,
        mentee_id: currentUserId,
        date_time: dateTime,
        topic: topic,
        notes: notes
      })
    });
    if (!res.ok) throw new Error("Failed to request session");
    return await res.json();
  },

  async confirmSession(sessionId) {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/confirm`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to confirm session");
    return await res.json();
  },

  // --- DIRECT 1-ON-1 MESSAGING (Mentors Only) ---
  async getDirectMessages(otherUserId) {
    const res = await fetch(`${API_BASE}/direct-messages?user_a=${currentUserId}&user_b=${otherUserId}`);
    if (!res.ok) throw new Error("Failed to load direct messages");
    return await res.json();
  },

  async sendDirectMessage(receiverId, message) {
    const res = await fetch(`${API_BASE}/direct-messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: currentUserId,
        receiver_id: receiverId,
        message: message
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Direct message failed");
    }
    return await res.json();
  }
};
