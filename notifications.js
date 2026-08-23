import { API } from "../api.js";

let sseConnection = null;

export function initNotifications() {
  const mount = document.getElementById("nav-notifications-mount");
  if (!mount) return;

  mount.innerHTML = `
    <div style="position: relative;">
      <button id="notif-bell-btn" class="nav-icon-btn" title="Real-time Scam & Opportunity Alerts">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        <span id="notif-badge" class="notif-badge-pill" style="display: none;">0</span>
      </button>

      <!-- Notification Dropdown Panel -->
      <div id="notif-dropdown" class="notif-dropdown-panel" style="display: none;">
        <div class="notif-panel-header">
          <div style="font-family: var(--font-display); font-weight: 700; font-size: 0.95rem;">Real-Time Safety Alerts</div>
          <button id="mark-all-read-btn" style="background: transparent; border: none; color: var(--brand-cyan); font-size: 0.76rem; font-weight: 700; cursor: pointer;">
            Mark all read
          </button>
        </div>
        <div id="notif-items-list" class="notif-list-body">
          <!-- Loaded dynamically -->
        </div>
      </div>
    </div>
  `;

  setupNotificationEvents(mount);
  startLiveNotificationStream();
}

export function startLiveNotificationStream() {
  if (sseConnection) {
    sseConnection.close();
  }

  // Initial load of stored notifications
  refreshNotificationsList();

  // Listen to SSE live stream
  sseConnection = API.subscribeToNotifications((newNotif) => {
    // Show instant audio/visual toast
    showLiveNotificationToast(newNotif);
    // Refresh bell badge & dropdown
    refreshNotificationsList();
  });
}

async function refreshNotificationsList() {
  const badge = document.getElementById("notif-badge");
  const listContainer = document.getElementById("notif-items-list");
  if (!badge || !listContainer) return;

  try {
    const notifs = await API.getNotifications();
    const unreadCount = notifs.filter(n => !n.read).length;

    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
      badge.style.display = "flex";
      badge.classList.add("pulse");
    } else {
      badge.style.display = "none";
      badge.classList.remove("pulse");
    }

    if (!notifs || notifs.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 24px 16px; color: var(--text-muted); font-size: 0.82rem;">
          No notifications yet. You'll receive real-time alerts when new scams or connections appear.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = notifs.map(n => {
      let icon = "⚠️";
      let borderCol = "var(--risk-danger)";
      if (n.severity === "success") { icon = "🎉"; borderCol = "var(--risk-safe)"; }
      else if (n.severity === "info") { icon = "🤝"; borderCol = "var(--brand-cyan)"; }

      return `
        <div class="notif-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}" data-tab="${n.link_tab}" data-link="${n.link_id || ''}" style="border-left: 3px solid ${borderCol};">
          <div style="font-size: 1.1rem; line-height: 1;">${icon}</div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); margin-bottom: 2px;">${n.title}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.35;">${n.message}</div>
            <div style="font-size: 0.72rem; color: var(--text-subtle); margin-top: 4px; font-family: var(--font-mono);">${n.created_at}</div>
          </div>
          ${!n.read ? `<div class="unread-dot" title="Unread"></div>` : ''}
        </div>
      `;
    }).join("");

    // Click handler on notification items
    listContainer.querySelectorAll(".notif-item").forEach(item => {
      item.addEventListener("click", async () => {
        const notifId = item.getAttribute("data-id");
        const targetTab = item.getAttribute("data-tab");
        await API.markNotificationRead(notifId);
        
        // Hide dropdown
        const dropdown = document.getElementById("notif-dropdown");
        if (dropdown) dropdown.style.display = "none";
        
        refreshNotificationsList();

        // Switch to target tab
        if (targetTab) {
          const tabBtn = document.querySelector(`[data-tab="${targetTab}"]`);
          if (tabBtn) tabBtn.click();
        }
      });
    });
  } catch (err) {
    console.warn("Could not refresh notifications:", err);
  }
}

function showLiveNotificationToast(notif) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast live-alert";
  toast.innerHTML = `
    <div style="font-size: 1.3rem;">⚡</div>
    <div>
      <div style="font-weight: 800; font-size: 0.86rem; color: #FFFFFF;">${notif.title}</div>
      <div style="font-size: 0.8rem; color: #E2E8F0;">${notif.message}</div>
    </div>
  `;
  container.appendChild(toast);

  toast.addEventListener("click", () => {
    if (notif.link_tab) {
      const tabBtn = document.querySelector(`[data-tab="${notif.link_tab}"]`);
      if (tabBtn) tabBtn.click();
    }
    toast.remove();
  });

  setTimeout(() => {
    toast.remove();
  }, 6000);
}

function setupNotificationEvents(mount) {
  const bellBtn = mount.querySelector("#notif-bell-btn");
  const dropdown = mount.querySelector("#notif-dropdown");
  const markAllBtn = mount.querySelector("#mark-all-read-btn");

  bellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    if (dropdown.style.display === "block") {
      refreshNotificationsList();
    }
  });

  document.addEventListener("click", (e) => {
    if (!mount.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  markAllBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    await API.markAllNotificationsRead();
    refreshNotificationsList();
  });
}
