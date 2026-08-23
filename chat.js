import { API } from "../api.js";

const DEFAULT_GREETING = {
  role: "assistant",
  content: "👋 Hi! I'm your **ScamX AI Career & Safety Assistant**.\n\nI can help you practice for real technical and behavioral interviews with STAR framework feedback, optimize your resume for ATS algorithms, discover pre-verified internships, or run safety checks on suspicious recruiters.\n\nWhat would you like to work on today?"
};

export async function initChat() {
  const container = document.getElementById("chat-container");
  if (!container) return;

  const currentUserId = API.getCurrentUserId();
  const userProfile = await API.getUserProfile(currentUserId);
  const userName = userProfile ? userProfile.name.split(" ")[0] : "Student";

  container.innerHTML = `
    <div class="chat-container">
      <!-- Chat Sidebar with Workflows & Actions -->
      <div class="chat-sidebar">
        <div>
          <div class="section-tag" style="margin-bottom: 8px;">AI Career Suite</div>
          <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; margin-bottom: 4px;">Career Prep & Safety</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Real-time mock interviews with STAR feedback and built-in scam guardrails.</p>
        </div>

        <button class="btn-secondary" id="new-chat-btn" style="width: 100%; justify-content: center; font-size: 0.84rem; padding: 8px 12px; margin-top: 4px;">
          <span>✨ Start New Conversation</span>
        </button>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          <div style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: var(--text-subtle);">Quick Workflows</div>
          <button class="chat-quick-btn" data-msg="Give me a software engineering mock interview question">
            <span>🎯</span> Software Mock Q&A
          </button>
          <button class="chat-quick-btn" data-msg="Give me a product design mock interview question">
            <span>🎨</span> UX Design Mock Q&A
          </button>
          <button class="chat-quick-btn" data-msg="Recommend top verified internships matching my profile">
            <span>💼</span> Match Safe Openings
          </button>
          <button class="chat-quick-btn" data-msg="How can I improve my tech resume for ATS algorithms?">
            <span>📄</span> Resume Impact Tips
          </button>
          <button class="chat-quick-btn" data-msg="Is it legit if a recruiter wants to interview on Telegram and asks for a $50 deposit?">
            <span>🛡️</span> Safety Check Question
          </button>
        </div>

        <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border-subtle);">
          <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--risk-safe)" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span>Autonomous Safety Guardrail Active</span>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="chat-main">
        <!-- Clean Chat Header (No stray numbers) -->
        <div style="padding: 14px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; background: rgba(14, 19, 31, 0.4);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--risk-safe); box-shadow: 0 0 8px var(--risk-safe);"></div>
            <div style="font-family: var(--font-display); font-weight: 700; font-size: 1rem; color: var(--text-main);">
              ScamX Career & Safety Assistant
            </div>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">
            Active User: <strong style="color: var(--brand-cyan);">${userProfile ? userProfile.name : currentUserId}</strong>
          </div>
        </div>

        <div class="chat-messages" id="chat-messages-box">
          <!-- Loaded dynamically from persistent history -->
        </div>

        <!-- Input Area -->
        <form class="chat-input-area" id="chat-input-form">
          <input type="text" id="chat-input-field" class="chat-input" placeholder="Ask a question, practice an interview answer, or paste an offer to check..." autocomplete="off" />
          <button type="submit" class="btn-primary" style="padding: 10px 18px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  `;

  setupChatEvents(container, userName);
}

async function setupChatEvents(container, userName) {
  const messagesBox = container.querySelector("#chat-messages-box");
  const form = container.querySelector("#chat-input-form");
  const input = container.querySelector("#chat-input-field");
  const quickBtns = container.querySelectorAll(".chat-quick-btn");
  const newChatBtn = container.querySelector("#new-chat-btn");

  let messages = [];

  // Load persistent chat history from backend
  messagesBox.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem;">Loading conversation...</div>`;
  
  try {
    const history = await API.getChatHistory();
    if (history && history.length > 0) {
      messages = history.map(h => ({ role: h.role, content: h.content }));
    } else {
      const personalizedGreeting = {
        role: "assistant",
        content: `👋 Hi ${userName}! I'm your **ScamX AI Career & Safety Assistant**.\n\nI can help you practice for real technical and behavioral interviews with STAR framework feedback, optimize your resume for ATS algorithms, discover pre-verified internships, or run safety checks on suspicious recruiters.\n\nWhat would you like to work on today?`
      };
      messages = [personalizedGreeting];
    }
  } catch (err) {
    messages = [DEFAULT_GREETING];
  }

  function renderMessages() {
    messagesBox.innerHTML = messages.map(m => `
      <div class="msg-bubble ${m.role}">
        ${formatMarkdown(m.content)}
      </div>
    `).join("");
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function formatMarkdown(text) {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em;">$1</code>')
      .replace(/\n/g, '<br/>');
    return html;
  }

  renderMessages();

  // Reset / New Chat Button
  newChatBtn.addEventListener("click", async () => {
    if (confirm("Start a fresh conversation thread?")) {
      await API.resetChatHistory();
      messages = [{
        role: "assistant",
        content: `👋 Starting a fresh thread! How can I assist you with your career prep or opportunity safety today, ${userName}?`
      }];
      renderMessages();
    }
  });

  // Submit Message Form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    messages.push({ role: "user", content: text });
    input.value = "";
    renderMessages();

    // Show typing indicator
    const typingId = "typing-bubble";
    messagesBox.insertAdjacentHTML("beforeend", `
      <div id="${typingId}" class="msg-bubble assistant" style="color: var(--text-muted);">
        Thinking & analyzing...
      </div>
    `);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    try {
      const res = await API.sendChatMessage(text);
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      messages.push({ role: "assistant", content: res.reply });
      renderMessages();
    } catch (err) {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      messages.push({ role: "assistant", content: "Sorry, I had trouble connecting to the career service. Please try again!" });
      renderMessages();
    }
  });

  // Quick Action Buttons
  quickBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const msg = btn.getAttribute("data-msg");
      input.value = msg;
      form.dispatchEvent(new Event("submit"));
    });
  });
}
