import { API } from "../api.js";

export function initFeed() {
  const container = document.getElementById("feed-container");
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card">
      <div class="section-header">
        <div class="section-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          Proactive Verification Engine
        </div>
        <h2 class="section-title">Verified Student Opportunities Feed</h2>
        <p class="section-desc">Every listing is proactively scanned for official corporate domains, legitimate hiring recruiters, and strict zero-fee policies.</p>
      </div>

      <!-- Filter and Search Bar -->
      <div class="feed-filter-bar">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" id="feed-search-input" class="search-input" placeholder="Search by role, company, or tech stack..." />
        </div>

        <div class="filter-chips" id="role-filter-chips">
          <button class="filter-chip active" data-category="all">All Roles</button>
          <button class="filter-chip" data-category="Engineering">Engineering</button>
          <button class="filter-chip" data-category="Design">Design</button>
          <button class="filter-chip" data-category="Data">Data & AI</button>
        </div>

        <div class="filter-chips" id="worktype-filter-chips">
          <button class="filter-chip active" data-worktype="all">All Workplaces</button>
          <button class="filter-chip" data-worktype="Remote">Remote</button>
          <button class="filter-chip" data-worktype="Hybrid">Hybrid</button>
          <button class="filter-chip" data-worktype="On-site">On-site</button>
        </div>
      </div>

      <!-- Opportunities Grid -->
      <div class="opp-grid" id="opp-grid-mount">
        <!-- Cards loaded dynamically -->
      </div>
    </div>

    <!-- Opportunity Detail Modal Container -->
    <div id="opp-modal" class="modal-backdrop">
      <div class="modal-box" id="opp-modal-content" style="max-width: 650px;">
        <!-- Loaded dynamically -->
      </div>
    </div>
  `;

  setupFeedEvents(container);
}

function setupFeedEvents(container) {
  const searchInput = container.querySelector("#feed-search-input");
  const roleChips = container.querySelectorAll("#role-filter-chips .filter-chip");
  const workTypeChips = container.querySelectorAll("#worktype-filter-chips .filter-chip");
  const gridMount = container.querySelector("#opp-grid-mount");
  const modal = container.querySelector("#opp-modal");
  const modalContent = container.querySelector("#opp-modal-content");

  let currentCategory = "all";
  let currentWorkType = "all";
  let currentSearch = "";
  let opportunitiesData = [];

  async function loadOpportunities() {
    gridMount.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Loading verified opportunities...</div>`;
    
    try {
      opportunitiesData = await API.getOpportunities(currentCategory, currentSearch, currentWorkType);
      renderGrid(opportunitiesData);
    } catch (err) {
      gridMount.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--risk-danger);">Failed to load opportunities.</div>`;
    }
  }

  function renderGrid(opps) {
    if (!opps || opps.length === 0) {
      gridMount.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: var(--bg-input); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">No matching opportunities found</div>
          <div style="color: var(--text-muted); font-size: 0.85rem;">Try adjusting your search terms or filters.</div>
        </div>
      `;
      return;
    }

    gridMount.innerHTML = opps.map(opp => `
      <div class="opp-card" data-id="${opp.id}">
        <div>
          <div class="opp-header">
            <div>
              <div class="opp-company">${opp.company}</div>
              <div class="opp-title">${opp.title}</div>
            </div>
            <div class="trust-badge-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <span>${opp.trust_score}% Trust</span>
            </div>
          </div>

          <div class="opp-meta-row">
            <span class="meta-tag stipend">${opp.stipend.split("+")[0]}</span>
            <span class="meta-tag">📍 ${opp.location.split("/")[0]}</span>
            <span class="meta-tag">💼 ${opp.work_type}</span>
          </div>

          <div class="opp-desc">
            ${opp.description.slice(0, 130)}...
          </div>
        </div>

        <div class="opp-footer">
          <span style="font-size: 0.76rem; color: var(--text-subtle);">Via ${opp.source_platform} • ${opp.posted_date}</span>
          <button class="btn-secondary view-opp-btn" data-id="${opp.id}" style="font-size: 0.8rem; padding: 6px 12px;">
            Details & Proof ↗
          </button>
        </div>
      </div>
    `).join("");

    // Attach click events to open modal
    gridMount.querySelectorAll(".view-opp-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const selected = opportunitiesData.find(o => o.id === id);
        if (selected) showOppModal(selected);
      });
    });
  }

  function showOppModal(opp) {
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <span class="section-tag" style="margin-bottom: 6px;">${opp.company}</span>
          <h3 style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 700;">${opp.title}</h3>
        </div>
        <button id="close-modal-btn" style="background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
      </div>

      <div class="opp-meta-row" style="margin-bottom: 16px;">
        <span class="meta-tag stipend" style="font-size: 0.85rem;">💰 ${opp.stipend}</span>
        <span class="meta-tag" style="font-size: 0.85rem;">📍 ${opp.location}</span>
        <span class="meta-tag" style="font-size: 0.85rem;">🏢 ${opp.work_type}</span>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--brand-cyan); margin-bottom: 6px;">Role Description</div>
        <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">${opp.description}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--brand-cyan); margin-bottom: 6px;">Key Requirements</div>
        <ul style="list-style: disc; padding-left: 20px; font-size: 0.86rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 4px;">
          ${opp.requirements.map(r => `<li>${r}</li>`).join("")}
        </ul>
      </div>

      <!-- Trust Signals Box -->
      <div style="background: var(--risk-safe-bg); border: 1px solid var(--risk-safe-border); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 6px; color: var(--risk-safe); font-weight: 700; font-size: 0.85rem; margin-bottom: 6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          Why ScamX Verifies This Opportunity (${opp.trust_score}/100 Trust Score)
        </div>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: #D1FAE5;">
          ${opp.trust_reasons.map(r => `<li>✓ ${r}</li>`).join("")}
        </ul>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
        <span style="font-size: 0.78rem; color: var(--text-subtle);">Direct Official Career Portal Link</span>
        <a href="${opp.source_url}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="text-decoration: none; font-size: 0.88rem; padding: 10px 20px;">
          Apply on Official Site ↗
        </a>
      </div>
    `;

    modal.classList.add("open");

    modalContent.querySelector("#close-modal-btn").addEventListener("click", () => {
      modal.classList.remove("open");
    });
  }

  // Modal backdrop click close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });

  // Filter chips
  roleChips.forEach(chip => {
    chip.addEventListener("click", () => {
      roleChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentCategory = chip.getAttribute("data-category");
      loadOpportunities();
    });
  });

  workTypeChips.forEach(chip => {
    chip.addEventListener("click", () => {
      workTypeChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentWorkType = chip.getAttribute("data-worktype");
      loadOpportunities();
    });
  });

  // Search debounce
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value.trim();
      loadOpportunities();
    }, 250);
  });

  // Initial Load
  loadOpportunities();
}
