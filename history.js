import { API } from "../api.js";

export function initHistory() {
  const container = document.getElementById("history-container");
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card">
      <div class="section-header">
        <div class="section-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Personal Security Vault
        </div>
        <h2 class="section-title">My Authenticity Scan History</h2>
        <p class="section-desc">Review your past opportunity scans, risk scores, and security breakdowns anytime.</p>
      </div>

      <div id="history-list-mount">
        <!-- Loaded dynamically -->
      </div>
    </div>
  `;

  loadHistory(container);
}

async function loadHistory(container) {
  const mount = container.querySelector("#history-list-mount");
  mount.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">Loading recent scans...</div>`;

  try {
    const scans = await API.getRecentScans();
    if (!scans || scans.length === 0) {
      mount.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: var(--bg-input); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); margin-bottom: 4px;">No Scans Yet</div>
          <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">Run your first authenticity check from the Scanner tab or using the ScamX browser extension.</div>
          <button class="btn-primary" id="go-to-scanner-btn">Start a Scan</button>
        </div>
      `;
      const btn = mount.querySelector("#go-to-scanner-btn");
      if (btn) {
        btn.addEventListener("click", () => {
          const scannerNav = document.querySelector('[data-tab="scanner"]');
          if (scannerNav) scannerNav.click();
        });
      }
      return;
    }

    mount.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${scans.map(s => {
          let badgeClass = "safe";
          let badgeLabel = "Low Risk";
          if (s.risk_score >= 70 || s.risk_level === "HIGH_RISK") {
            badgeClass = "danger";
            badgeLabel = "High Risk Scam";
          } else if (s.risk_score >= 30 || s.risk_level === "CAUTION") {
            badgeClass = "caution";
            badgeLabel = "Caution";
          }

          return `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                  <span class="score-badge-pill ${badgeClass}" style="font-size: 0.75rem; padding: 2px 10px;">${badgeLabel} (${s.risk_score}/100)</span>
                  <span style="font-size: 0.78rem; color: var(--text-subtle); font-family: var(--font-mono);">${s.created_at}</span>
                </div>
                <div style="font-weight: 700; color: var(--text-main); font-size: 1rem;">${s.title}</div>
                <div style="font-size: 0.84rem; color: var(--text-muted); margin-top: 2px;">${s.summary}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--brand-cyan); background: var(--brand-cyan-glow); padding: 4px 10px; border-radius: 6px;">
                  ${s.company_detected || 'Generic Offer'}
                </span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  } catch (err) {
    mount.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--risk-danger);">Failed to load history.</div>`;
  }
}
