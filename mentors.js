import { API } from "../api.js";

export function initMentors() {
  const container = document.getElementById("mentors-container");
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card">
      <div class="section-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <div class="section-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Peer & Industry Network
          </div>
          <h2 class="section-title">Mentors & Student Connections</h2>
          <p class="section-desc">Connect with verified senior engineers, designers, and peers for 1-on-1 mentorship, mock reviews, and safe career guidance.</p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn-secondary" id="open-edit-profile-btn" style="font-size: 0.85rem;">
            ✏️ Edit My Profile
          </button>
          <button class="btn-primary" id="open-register-mentor-btn" style="font-size: 0.85rem;">
            🌟 Register as Mentor
          </button>
        </div>
      </div>

      <!-- Navigation Tabs inside Network: Directory | My Connections | Scheduled Sessions -->
      <div class="input-modes-bar" style="margin-bottom: 20px;">
        <button class="mode-chip active" id="subtab-mentors-btn">
          <span>🌟 Verified Mentors</span>
        </button>
        <button class="mode-chip" id="subtab-all-users-btn">
          <span>👥 All Student Peers</span>
        </button>
        <button class="mode-chip" id="subtab-connections-btn">
          <span>🤝 My Connections</span>
        </button>
        <button class="mode-chip" id="subtab-sessions-btn">
          <span>📅 Mentor Sessions</span>
        </button>
      </div>

      <!-- Filter and Search Bar -->
      <div class="feed-filter-bar">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" id="network-search-input" class="search-input" placeholder="Search mentors by name, company, or expertise..." />
        </div>

        <div class="filter-chips" id="network-sector-chips">
          <button class="filter-chip active" data-sector="all">All Sectors</button>
          <button class="filter-chip" data-sector="Engineering">Engineering</button>
          <button class="filter-chip" data-sector="Design">Design</button>
          <button class="filter-chip" data-sector="Data">Data & AI</button>
        </div>
      </div>

      <!-- Main Directory Mount Point -->
      <div id="network-cards-mount" class="opp-grid">
        <!-- Cards loaded dynamically -->
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div id="edit-profile-modal" class="modal-backdrop">
      <div class="modal-box" style="max-width: 500px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;">Edit My Profile</h3>
          <button class="close-modal-btn" data-target="edit-profile-modal" style="background: transparent; border: none; color: var(--text-muted); font-size: 1.4rem; cursor: pointer;">&times;</button>
        </div>
        <form id="edit-profile-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="profile-name" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Major / Field of Study</label>
            <input type="text" id="profile-major" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" id="profile-location" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Short Bio</label>
            <textarea id="profile-bio" class="form-textarea" rows="3"></textarea>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px;">
            <button type="button" class="btn-secondary close-modal-btn" data-target="edit-profile-modal">Cancel</button>
            <button type="submit" class="btn-primary">Save Profile</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Register as Mentor Modal -->
    <div id="register-mentor-modal" class="modal-backdrop">
      <div class="modal-box" style="max-width: 520px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;">🌟 Register as a ScamX Mentor</h3>
          <button class="close-modal-btn" data-target="register-mentor-modal" style="background: transparent; border: none; color: var(--text-muted); font-size: 1.4rem; cursor: pointer;">&times;</button>
        </div>
        <form id="register-mentor-form">
          <div class="form-group">
            <label class="form-label">Areas of Expertise</label>
            <input type="text" id="mentor-expertise" class="form-input" placeholder="e.g. Distributed Systems, LeetCode Prep, Design Portfolios" required />
          </div>
          <div class="form-group">
            <label class="form-label">Active Sectors (Comma Separated)</label>
            <input type="text" id="mentor-sectors" class="form-input" placeholder="Engineering, Data, Design" required />
          </div>
          <div class="form-group">
            <label class="form-label">Mentorship Availability</label>
            <input type="text" id="mentor-availability" class="form-input" placeholder="e.g. 2 sessions/week (Fridays 4-6pm)" required />
          </div>
          <div class="form-group">
            <label class="form-label">Mentorship Statement & Background</label>
            <textarea id="mentor-bio" class="form-textarea" rows="3" placeholder="Tell students how you can help them navigate technical interviews and legitimate opportunities..."></textarea>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px;">
            <button type="button" class="btn-secondary close-modal-btn" data-target="register-mentor-modal">Cancel</button>
            <button type="submit" class="btn-primary">Activate Mentor Badge 🚀</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Schedule Mentor Session Modal -->
    <div id="schedule-session-modal" class="modal-backdrop">
      <div class="modal-box" style="max-width: 480px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;">📅 Schedule Mentorship Session</h3>
          <button class="close-modal-btn" data-target="schedule-session-modal" style="background: transparent; border: none; color: var(--text-muted); font-size: 1.4rem; cursor: pointer;">&times;</button>
        </div>
        <form id="schedule-session-form">
          <input type="hidden" id="session-mentor-id" />
          <div class="form-group">
            <label class="form-label">Mentor</label>
            <input type="text" id="session-mentor-name" class="form-input" readonly />
          </div>
          <div class="form-group">
            <label class="form-label">Proposed Date & Time</label>
            <input type="text" id="session-datetime" class="form-input" placeholder="e.g., Friday, 4:00 PM EST" required />
          </div>
          <div class="form-group">
            <label class="form-label">Discussion Topic</label>
            <input type="text" id="session-topic" class="form-input" placeholder="e.g., Technical Interview Mock & Resume Critique" required />
          </div>
          <div class="form-group">
            <label class="form-label">Notes for Mentor</label>
            <textarea id="session-notes" class="form-textarea" rows="2" placeholder="Specific questions or context you want to cover..."></textarea>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px;">
            <button type="button" class="btn-secondary close-modal-btn" data-target="schedule-session-modal">Cancel</button>
            <button type="submit" class="btn-primary">Send Session Request</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Human-to-Human 1-on-1 Direct Chat Modal (Mentors Only) -->
    <div id="direct-chat-modal" class="modal-backdrop">
      <div class="modal-box" style="max-width: 580px; height: 600px; display: flex; flex-direction: column; padding: 0; overflow: hidden;">
        <!-- DM Header -->
        <div style="padding: 16px 20px; background: rgba(14, 19, 31, 0.95); border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div id="dm-avatar" class="user-avatar" style="width: 36px; height: 36px; font-size: 0.9rem;">M</div>
            <div>
              <div id="dm-recipient-name" style="font-weight: 700; font-size: 1rem; color: var(--text-main);">Dr. Marcus Vance</div>
              <div style="font-size: 0.76rem; color: var(--risk-safe); display: flex; align-items: center; gap: 4px;">
                <span>●</span> Verified Mentor Direct Thread
              </div>
            </div>
          </div>
          <button class="close-modal-btn" data-target="direct-chat-modal" style="background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>

        <!-- DM Messages Box -->
        <div id="dm-messages-box" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: var(--bg-surface);">
          <!-- Loaded dynamically -->
        </div>

        <!-- DM Input Area -->
        <form id="dm-input-form" style="padding: 14px 18px; border-top: 1px solid var(--border-subtle); background: var(--bg-card); display: flex; gap: 10px;">
          <input type="text" id="dm-input-field" class="chat-input" placeholder="Type a direct message to your mentor..." required autocomplete="off" />
          <button type="submit" class="btn-primary" style="padding: 10px 18px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  `;

  setupMentorsEvents(container);
}

function setupMentorsEvents(container) {
  const mount = container.querySelector("#network-cards-mount");
  const subtabMentorsBtn = container.querySelector("#subtab-mentors-btn");
  const subtabAllUsersBtn = container.querySelector("#subtab-all-users-btn");
  const subtabConnectionsBtn = container.querySelector("#subtab-connections-btn");
  const subtabSessionsBtn = container.querySelector("#subtab-sessions-btn");
  const searchInput = container.querySelector("#network-search-input");
  const sectorChips = container.querySelectorAll("#network-sector-chips .filter-chip");

  let activeSubtab = "mentors"; // "mentors", "all_users", "connections", "sessions"
  let currentSector = "all";
  let currentSearch = "";

  // Active DM state
  let activeDmRecipientId = null;

  async function loadNetworkView() {
    mount.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Loading network...</div>`;

    if (activeSubtab === "mentors" || activeSubtab === "all_users") {
      try {
        const users = activeSubtab === "mentors" 
          ? await API.getMentors(currentSector, currentSearch)
          : await API.getUsers(currentSector, currentSearch);
        
        renderUsersGrid(users);
      } catch (e) {
        mount.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--risk-danger);">Failed to load profiles.</div>`;
      }
    } else if (activeSubtab === "connections") {
      try {
        const connections = await API.getConnections();
        renderConnectionsList(connections);
      } catch (e) {
        mount.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--risk-danger);">Failed to load connections.</div>`;
      }
    } else if (activeSubtab === "sessions") {
      try {
        const sessions = await API.getSessions();
        renderSessionsList(sessions);
      } catch (e) {
        mount.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--risk-danger);">Failed to load sessions.</div>`;
      }
    }
  }

  function renderUsersGrid(users) {
    const currentUserId = API.getCurrentUserId();
    if (!users || users.length === 0) {
      mount.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-input); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle); color: var(--text-muted);">
          No profiles found matching this search or filter.
        </div>
      `;
      return;
    }

    mount.innerHTML = users.map(u => {
      const isSelf = u.user_id === currentUserId;
      return `
        <div class="opp-card" style="padding: 22px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="user-avatar" style="background: ${u.avatar_color || '#8B5CF6'}; width: 44px; height: 44px; font-size: 1.1rem; font-weight: 700;">
                  ${u.name.charAt(0)}
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main);">${u.name}</div>
                  <div style="font-size: 0.8rem; color: var(--brand-cyan); font-weight: 600;">${u.major}</div>
                </div>
              </div>
              ${u.is_mentor ? `
                <div class="score-badge-pill safe" style="font-size: 0.75rem; padding: 3px 8px;">
                  <span>🌟 Verified Mentor</span>
                </div>
              ` : ''}
            </div>

            <div style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px;">
              ${u.bio || 'Exploring opportunities and networking safely.'}
            </div>

            ${u.is_mentor && u.mentor_expertise ? `
              <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 14px; font-size: 0.78rem;">
                <div style="font-weight: 700; color: var(--brand-cyan); margin-bottom: 2px;">Expertise:</div>
                <div style="color: #E2E8F0;">${u.mentor_expertise}</div>
                ${u.mentor_availability ? `<div style="color: var(--text-muted); margin-top: 4px;">🗓️ ${u.mentor_availability}</div>` : ''}
              </div>
            ` : ''}

            <div class="opp-meta-row">
              <span class="meta-tag">📍 ${u.location}</span>
              ${u.followed_sectors.map(s => `<span class="meta-tag">#${s}</span>`).join("")}
            </div>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--border-subtle); padding-top: 14px; margin-top: 10px;">
            ${isSelf ? `
              <span style="font-size: 0.8rem; color: var(--text-subtle); font-style: italic;">Your Profile</span>
            ` : `
              <button class="btn-primary connect-user-btn" data-id="${u.user_id}" style="font-size: 0.82rem; padding: 8px 14px;">
                🤝 Connect
              </button>
            `}
          </div>
        </div>
      `;
    }).join("");

    // Attach Connect buttons
    mount.querySelectorAll(".connect-user-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const targetId = btn.getAttribute("data-id");
        btn.textContent = "Requesting...";
        btn.disabled = true;
        try {
          await API.sendConnectionRequest(targetId);
          btn.textContent = "✓ Request Sent";
          btn.style.background = "var(--bg-card)";
          btn.style.borderColor = "var(--risk-safe)";
        } catch (err) {
          alert(err.message);
          btn.textContent = "🤝 Connect";
          btn.disabled = false;
        }
      });
    });
  }

  function renderConnectionsList(connections) {
    if (!connections || connections.length === 0) {
      mount.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-input); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle); color: var(--text-muted);">
          <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); margin-bottom: 4px;">No Connections Yet</div>
          <div style="font-size: 0.85rem;">Browse the Verified Mentors or Student directory to send connection requests.</div>
        </div>
      `;
      return;
    }

    mount.innerHTML = connections.map(c => {
      const other = c.other_user;
      if (!other) return '';

      const isPending = c.status === "pending";
      const isAccepted = c.status === "accepted";
      const isDeclined = c.status === "declined";
      const isIncoming = c.is_incoming;
      // DM is only available when the other party is a registered mentor
      const canDM = isAccepted && other.is_mentor;

      let statusBadgeClass = "caution";
      let statusLabel = "Request Pending";
      if (isAccepted)  { statusBadgeClass = "safe";   statusLabel = "✓ Connected"; }
      if (isDeclined)  { statusBadgeClass = "danger";  statusLabel = "Declined"; }
      if (isPending && isIncoming) statusLabel = "Pending Your Approval";

      return `
        <div class="opp-card" style="padding: 20px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="user-avatar" style="background: ${other.avatar_color || '#8B5CF6'}; width: 40px; height: 40px; font-size: 1rem;">
                  ${other.name.charAt(0)}
                </div>
                <div>
                  <div style="font-weight: 700; color: var(--text-main);">${other.name}</div>
                  <div style="font-size: 0.78rem; color: var(--brand-cyan);">${other.major}</div>
                </div>
              </div>
              <span class="score-badge-pill ${statusBadgeClass}" style="font-size: 0.72rem; padding: 2px 8px;">
                ${statusLabel}
              </span>
            </div>

            <div style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 12px;">
              ${other.bio || 'Exploring opportunities and networking safely.'}
            </div>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
            ${isIncoming && isPending ? `
              <button class="btn-secondary respond-conn-btn" data-id="${c.id}" data-action="declined" style="font-size: 0.78rem; padding: 6px 12px; color: var(--risk-danger);">
                Decline
              </button>
              <button class="btn-primary respond-conn-btn" data-id="${c.id}" data-action="accepted" style="font-size: 0.78rem; padding: 6px 14px;">
                Accept Connection
              </button>
            ` : isAccepted ? `
              ${canDM ? `
                <button class="btn-secondary schedule-session-btn" data-mentor-id="${other.user_id}" data-mentor-name="${other.name}" style="font-size: 0.78rem; padding: 6px 12px;">
                  📅 Book Session
                </button>
                <button class="btn-primary open-dm-btn" data-user-id="${other.user_id}" data-user-name="${other.name}" style="font-size: 0.78rem; padding: 6px 14px;">
                  💬 Direct Message
                </button>
              ` : `
                <span style="font-size: 0.78rem; color: var(--text-muted); align-self: center;">Connected Peer</span>
              `}
              <button class="btn-secondary remove-conn-btn" data-id="${c.id}" title="Remove this connection" style="font-size: 0.76rem; padding: 6px 10px; color: var(--risk-danger); border-color: var(--risk-danger);">
                🗑 Remove
              </button>
            ` : isDeclined ? `
              <span style="font-size: 0.78rem; color: var(--text-muted); align-self: center;">Request declined</span>
              <button class="btn-primary resend-conn-btn" data-id="${other.user_id}" style="font-size: 0.78rem; padding: 6px 14px;">
                🔄 Re-send Request
              </button>
            ` : `
              <span style="font-size: 0.8rem; color: var(--text-subtle);">Awaiting approval</span>
            `}
          </div>
        </div>
      `;
    }).join("");

    // Accept / Decline handlers
    mount.querySelectorAll(".respond-conn-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const connId = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action");
        btn.disabled = true;
        try {
          await API.respondConnection(connId, action);
          loadNetworkView();
        } catch (e) {
          alert(e.message);
          btn.disabled = false;
        }
      });
    });

    // Remove connection handlers
    mount.querySelectorAll(".remove-conn-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const connId = btn.getAttribute("data-id");
        if (!confirm("Remove this connection? Either party can send a new request afterwards.")) return;
        btn.disabled = true;
        try {
          await API.deleteConnection(connId);
          loadNetworkView();
        } catch (e) {
          alert(e.message);
          btn.disabled = false;
        }
      });
    });

    // Re-send request handlers (for declined connections)
    mount.querySelectorAll(".resend-conn-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const targetId = btn.getAttribute("data-id");
        btn.textContent = "Sending...";
        btn.disabled = true;
        try {
          await API.sendConnectionRequest(targetId);
          loadNetworkView();
        } catch (e) {
          alert(e.message);
          btn.textContent = "🔄 Re-send Request";
          btn.disabled = false;
        }
      });
    });

    // Schedule Session handlers
    mount.querySelectorAll(".schedule-session-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const mentorId = btn.getAttribute("data-mentor-id");
        const mentorName = btn.getAttribute("data-mentor-name");
        openScheduleModal(mentorId, mentorName);
      });
    });

    // Direct Message handlers
    mount.querySelectorAll(".open-dm-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetUserId = btn.getAttribute("data-user-id");
        const targetUserName = btn.getAttribute("data-user-name");
        openDirectChatModal(targetUserId, targetUserName);
      });
    });
  }


  function renderSessionsList(sessions) {
    if (!sessions || sessions.length === 0) {
      mount.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-input); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle); color: var(--text-muted);">
          <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); margin-bottom: 4px;">No Mentorship Sessions Yet</div>
          <div style="font-size: 0.85rem;">Connect with a mentor and click 'Book Session' to schedule 1-on-1 interview and career coaching.</div>
        </div>
      `;
      return;
    }

    mount.innerHTML = sessions.map(s => {
      const isConfirmed = s.status === "confirmed";
      const currentUserId = API.getCurrentUserId();
      const isMentorUser = s.mentor_id === currentUserId;

      return `
        <div class="opp-card" style="padding: 20px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <span class="section-tag" style="margin-bottom: 4px;">Topic: ${s.topic}</span>
                <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main);">
                  ${s.mentee_name} ↔ ${s.mentor_name}
                </div>
              </div>
              <span class="score-badge-pill ${isConfirmed ? 'safe' : 'caution'}" style="font-size: 0.72rem; padding: 2px 8px;">
                ${isConfirmed ? '✓ Confirmed' : 'Pending Confirmation'}
              </span>
            </div>

            <div style="background: var(--bg-card); border-radius: var(--radius-sm); padding: 10px; margin: 10px 0; font-size: 0.82rem;">
              <div style="color: var(--brand-cyan); font-weight: 700;">🗓️ Proposed Date/Time:</div>
              <div style="color: #FFF; font-weight: 600;">${s.date_time}</div>
              ${s.notes ? `<div style="color: var(--text-muted); margin-top: 4px;">Notes: ${s.notes}</div>` : ''}
            </div>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
            ${!isConfirmed && isMentorUser ? `
              <button class="btn-primary confirm-sess-btn" data-id="${s.id}" style="font-size: 0.8rem; padding: 6px 14px;">
                ✓ Confirm Session
              </button>
            ` : isConfirmed ? `
              <span style="font-size: 0.8rem; color: var(--risk-safe); font-weight: 600;">Confirmed on Calendar</span>
            ` : `
              <span style="font-size: 0.8rem; color: var(--text-subtle);">Awaiting Mentor Confirmation</span>
            `}
          </div>
        </div>
      `;
    }).join("");

    mount.querySelectorAll(".confirm-sess-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        try {
          await API.confirmSession(id);
          loadNetworkView();
        } catch (e) {
          alert(e.message);
        }
      });
    });
  }

  // --- Subtab Navigation ---
  subtabMentorsBtn.addEventListener("click", () => {
    activeSubtab = "mentors";
    updateSubtabs(subtabMentorsBtn);
    loadNetworkView();
  });

  subtabAllUsersBtn.addEventListener("click", () => {
    activeSubtab = "all_users";
    updateSubtabs(subtabAllUsersBtn);
    loadNetworkView();
  });

  subtabConnectionsBtn.addEventListener("click", () => {
    activeSubtab = "connections";
    updateSubtabs(subtabConnectionsBtn);
    loadNetworkView();
  });

  subtabSessionsBtn.addEventListener("click", () => {
    activeSubtab = "sessions";
    updateSubtabs(subtabSessionsBtn);
    loadNetworkView();
  });

  function updateSubtabs(activeBtn) {
    [subtabMentorsBtn, subtabAllUsersBtn, subtabConnectionsBtn, subtabSessionsBtn].forEach(b => b.classList.remove("active"));
    activeBtn.classList.add("active");
  }

  // Sector filters
  sectorChips.forEach(chip => {
    chip.addEventListener("click", () => {
      sectorChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentSector = chip.getAttribute("data-sector");
      loadNetworkView();
    });
  });

  // Search filter
  let searchTimer;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentSearch = e.target.value.trim();
      loadNetworkView();
    }, 250);
  });

  // Modal Triggers
  const editProfileBtn = container.querySelector("#open-edit-profile-btn");
  const editProfileModal = container.querySelector("#edit-profile-modal");
  const editProfileForm = container.querySelector("#edit-profile-form");

  editProfileBtn.addEventListener("click", async () => {
    const prof = await API.getUserProfile(API.getCurrentUserId());
    if (prof) {
      container.querySelector("#profile-name").value = prof.name || '';
      container.querySelector("#profile-major").value = prof.major || '';
      container.querySelector("#profile-location").value = prof.location || '';
      container.querySelector("#profile-bio").value = prof.bio || '';
    }
    editProfileModal.classList.add("open");
  });

  editProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const prof = await API.getUserProfile(API.getCurrentUserId());
    prof.name = container.querySelector("#profile-name").value.trim();
    prof.major = container.querySelector("#profile-major").value.trim();
    prof.location = container.querySelector("#profile-location").value.trim();
    prof.bio = container.querySelector("#profile-bio").value.trim();

    await API.saveUserProfile(prof);
    editProfileModal.classList.remove("open");
    loadNetworkView();
  });

  const registerMentorBtn = container.querySelector("#open-register-mentor-btn");
  const registerMentorModal = container.querySelector("#register-mentor-modal");
  const registerMentorForm = container.querySelector("#register-mentor-form");

  registerMentorBtn.addEventListener("click", () => {
    registerMentorModal.classList.add("open");
  });

  registerMentorForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const expertise = container.querySelector("#mentor-expertise").value.trim();
    const sectors = container.querySelector("#mentor-sectors").value.split(",").map(s => s.trim());
    const availability = container.querySelector("#mentor-availability").value.trim();
    const bio = container.querySelector("#mentor-bio").value.trim();

    await API.registerAsMentor({ expertise, sectors, availability, bio });
    registerMentorModal.classList.remove("open");
    activeSubtab = "mentors";
    updateSubtabs(subtabMentorsBtn);
    loadNetworkView();
  });

  // Schedule Session Modal logic
  const sessionModal = container.querySelector("#schedule-session-modal");
  const sessionForm = container.querySelector("#schedule-session-form");

  function openScheduleModal(mentorId, mentorName) {
    container.querySelector("#session-mentor-id").value = mentorId;
    container.querySelector("#session-mentor-name").value = mentorName;
    sessionModal.classList.add("open");
  }

  sessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mentorId = container.querySelector("#session-mentor-id").value;
    const dateTime = container.querySelector("#session-datetime").value.trim();
    const topic = container.querySelector("#session-topic").value.trim();
    const notes = container.querySelector("#session-notes").value.trim();

    try {
      await API.requestSession(mentorId, dateTime, topic, notes);
      sessionModal.classList.remove("open");
      sessionForm.reset();
      activeSubtab = "sessions";
      updateSubtabs(subtabSessionsBtn);
      loadNetworkView();
    } catch (err) {
      alert(err.message);
    }
  });

  // Direct Chat Modal DOM refs
  const dmModal = container.querySelector("#direct-chat-modal");
  const dmMessagesBox = container.querySelector("#dm-messages-box");
  const dmForm = container.querySelector("#dm-input-form");
  const dmInput = container.querySelector("#dm-input-field");
  const dmRecipientName = container.querySelector("#dm-recipient-name");
  const dmAvatar = container.querySelector("#dm-avatar");

  // Track active DM poll timer
  let dmPollTimer = null;

  function stopDmPolling() {
    if (dmPollTimer) {
      clearInterval(dmPollTimer);
      dmPollTimer = null;
    }
  }

  async function openDirectChatModal(targetUserId, targetUserName) {
    activeDmRecipientId = targetUserId;
    dmRecipientName.textContent = targetUserName;
    dmAvatar.textContent = targetUserName.charAt(0);
    dmModal.classList.add("open");
    // Initial load with loading shimmer
    await loadDirectMessages(true);
    // Start polling every 3 s while modal is open
    stopDmPolling();
    dmPollTimer = setInterval(() => loadDirectMessages(false), 3000);
  }

  async function loadDirectMessages(showLoading = false) {
    if (!activeDmRecipientId) return;
    if (showLoading) {
      dmMessagesBox.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem;">Loading messages...</div>`;
    }

    try {
      const messages = await API.getDirectMessages(activeDmRecipientId);
      const currentUserId = API.getCurrentUserId();

      if (!messages || messages.length === 0) {
        dmMessagesBox.innerHTML = `
          <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 0.85rem;">
            No messages yet. Send a direct greeting or request feedback from your mentor!
          </div>
        `;
        return;
      }

      const wasAtBottom =
        dmMessagesBox.scrollHeight - dmMessagesBox.scrollTop - dmMessagesBox.clientHeight < 40;

      dmMessagesBox.innerHTML = messages.map(m => {
        const isMe = m.sender_id === currentUserId;
        const timeStr = m.created_at ? m.created_at.split(" ").slice(1, 2).join(" ") : "";
        return `
          <div class="msg-bubble ${isMe ? 'user' : 'assistant'}" style="align-self: ${isMe ? 'flex-end' : 'flex-start'};">
            <div style="font-size: 0.72rem; font-weight: 700; color: ${isMe ? '#E9D5FF' : 'var(--brand-cyan)'}; margin-bottom: 2px;">
              ${m.sender_name} • ${timeStr}
            </div>
            <div>${m.message}</div>
          </div>
        `;
      }).join("");

      // Auto-scroll to bottom only when user was already at bottom
      if (wasAtBottom || showLoading) {
        dmMessagesBox.scrollTop = dmMessagesBox.scrollHeight;
      }
    } catch (e) {
      if (showLoading) {
        dmMessagesBox.innerHTML = `<div style="text-align: center; color: var(--risk-danger); font-size: 0.82rem;">${e.message}</div>`;
      }
    }
  }

  dmForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = dmInput.value.trim();
    if (!text || !activeDmRecipientId) return;

    try {
      await API.sendDirectMessage(activeDmRecipientId, text);
      dmInput.value = "";
      // Refresh immediately after sending without loading shimmer
      await loadDirectMessages(false);
      dmMessagesBox.scrollTop = dmMessagesBox.scrollHeight;
    } catch (err) {
      alert("Direct messaging failed: " + err.message);
    }
  });

  // Close modals — also stop DM polling when DM modal is closed
  container.querySelectorAll(".close-modal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const modalEl = document.getElementById(targetId);
      if (modalEl) {
        modalEl.classList.remove("open");
        if (targetId === "direct-chat-modal") {
          stopDmPolling();
          activeDmRecipientId = null;
        }
      }
    });
  });

  container.querySelectorAll(".modal-backdrop").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("open");
        if (modal.id === "direct-chat-modal") {
          stopDmPolling();
          activeDmRecipientId = null;
        }
      }
    });
  });

  // Initial load
  loadNetworkView();
}
