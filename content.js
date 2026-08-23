/**
 * ScamX Content Script
 * Displays in-page floating alert badge when an item is scanned via right-click.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SHOW_SCAN_TOOLTIP" && request.result) {
    showInPageNotification(request.result);
  }
});

function showInPageNotification(res) {
  // Remove existing notification if any
  const existing = document.getElementById("scamx-float-badge");
  if (existing) existing.remove();

  const isScam = res.risk_score >= 70;
  const isCaution = res.risk_score >= 30 && res.risk_score < 70;
  const borderColor = isScam ? "#EF4444" : isCaution ? "#F59E0B" : "#10B981";
  const bgColor = "#0E131F";

  const badge = document.createElement("div");
  badge.id = "scamx-float-badge";
  badge.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999999;
    background: ${bgColor};
    border: 2px solid ${borderColor};
    border-radius: 14px;
    padding: 16px 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #F8FAFC;
    max-width: 340px;
    animation: scamxSlideIn 0.3s ease-out;
  `;

  badge.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <div style="font-weight: 800; font-size: 14px; color: #8B5CF6; display: flex; align-items: center; gap: 6px;">
        <span>⚡</span> ScamX Verification
      </div>
      <span style="background: ${borderColor}; color: #000; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 10px;">
        Score: ${res.risk_score}/100
      </span>
    </div>
    <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${res.title}</div>
    <div style="font-size: 12px; color: #94A3B8; line-height: 1.4; margin-bottom: 10px;">${res.summary}</div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <a href="http://localhost:8000" target="_blank" style="color: #38BDF8; font-size: 11px; font-weight: 700; text-decoration: none;">Open Full Report ↗</a>
      <button id="scamx-close-toast" style="background: transparent; border: none; color: #64748B; cursor: pointer; font-size: 14px;">Dismiss</button>
    </div>
  `;

  document.body.appendChild(badge);

  badge.querySelector("#scamx-close-toast").addEventListener("click", () => {
    badge.remove();
  });

  setTimeout(() => {
    if (badge.parentNode) badge.remove();
  }, 9000);
}
