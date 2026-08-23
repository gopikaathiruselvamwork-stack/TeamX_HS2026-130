import { API } from "./api.js";
import { initScanner } from "./components/scanner.js";
import { initChat } from "./components/chat.js";
import { initFeed } from "./components/feed.js";
import { initForum } from "./components/forum.js";
import { initMentors } from "./components/mentors.js";
import { initHistory } from "./components/history.js";
import { initOnboarding } from "./components/onboarding.js";
import { initNotifications, startLiveNotificationStream } from "./components/notifications.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize Stats
  loadLiveStats();

  // Initialize Account Switcher
  setupUserAccountSwitcher();

  // Initialize Real-Time Notification Bell & Stream
  initNotifications();

  // Initialize Navigation Routing
  setupTabRouting();

  // Initialize Views
  initScanner();
  initChat();
  initFeed();
  initForum();
  initMentors();
  initHistory();

  // Trigger Onboarding if new
  initOnboarding();
});

async function loadLiveStats() {
  try {
    const stats = await API.getStats();
    const statTotalScans = document.getElementById("stat-total-scans");
    const statScamsPrevented = document.getElementById("stat-scams-prevented");
    const statVerifiedListings = document.getElementById("stat-verified-listings");
    const statActiveMentors = document.getElementById("stat-active-mentors");

    if (statTotalScans) statTotalScans.textContent = Number(stats.total_scans).toLocaleString();
    if (statScamsPrevented) statScamsPrevented.textContent = Number(stats.scams_prevented).toLocaleString();
    if (statVerifiedListings) statVerifiedListings.textContent = Number(stats.verified_listings).toLocaleString();
    if (statActiveMentors) statActiveMentors.textContent = Number(stats.active_mentors || 9).toLocaleString();
  } catch (err) {
    console.error("Stats load error:", err);
  }
}

function setupUserAccountSwitcher() {
  const switcher = document.getElementById("user-account-switcher");
  if (!switcher) return;

  switcher.value = API.getCurrentUserId();

  switcher.addEventListener("change", (e) => {
    const selectedUserId = e.target.value;
    API.setCurrentUserId(selectedUserId);

    // Restart real-time SSE stream for new user
    startLiveNotificationStream();

    // Refresh active components with user-isolated data
    initChat();
    initMentors();
    initHistory();

    showToast(`Switched active account to: ${e.target.options[e.target.selectedIndex].text.split("(")[0]}`, "success");
  });
}

function setupTabRouting() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      
      navButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(t => t.classList.remove("active"));

      btn.classList.add("active");
      const targetEl = document.getElementById(`tab-${targetTab}`);
      if (targetEl) {
        targetEl.classList.add("active");
      }

      // Re-trigger component load if switching tabs
      if (targetTab === "chat") {
        initChat();
      } else if (targetTab === "mentors") {
        initMentors();
      } else if (targetTab === "history") {
        initHistory();
      }
    });
  });
}

export function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4500);
}
