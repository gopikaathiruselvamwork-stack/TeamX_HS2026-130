import { API } from "../api.js";

export function initForum() {
  const container = document.getElementById("forum-container");
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card">
      <div class="forum-header-row">
        <div>
          <div class="section-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Peer Scam Intelligence Network
          </div>
          <h2 class="section-title">Student Experience Forum</h2>
          <p class="section-desc">Real reports submitted by university students to warn peers about fraudulent recruiters and confirm legitimate hiring experiences.</p>
        </div>
        <button class="btn-primary" id="open-new-post-modal-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Report a Scam / Share Review
        </button>
      </div>

      <!-- Search & Tag Filter Bar -->
      <div class="feed-filter-bar">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" id="forum-search-input" class="search-input" placeholder="Search reports by company, keyword, or scam type..." />
        </div>

        <div class="filter-chips" id="forum-tag-chips">
          <button class="filter-chip active" data-tag="all">All Discussions</button>
          <button class="filter-chip" data-tag="task scam">Task Scam</button>
          <button class="filter-chip" data-tag="fake offer letter">Fake Offer Letter</button>
          <button class="filter-chip" data-tag="advance fee">Advance Fee</button>
          <button class="filter-chip" data-tag="confirmed legit">Confirmed Legit</button>
        </div>
      </div>

      <!-- Forum Posts Feed -->
      <div class="forum-list" id="forum-posts-mount">
        <!-- Loaded dynamically -->
      </div>
    </div>

    <!-- Create Post Modal -->
    <div id="forum-modal" class="modal-backdrop">
      <div class="modal-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 700;">Submit Community Report</h3>
          <button id="close-forum-modal-btn" style="background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>

        <form id="forum-post-form">
          <div class="form-group">
            <label class="form-label">Report Type</label>
            <select id="post-category" class="form-select">
              <option value="task_scam">🚨 Task Scam / Deposit Scam</option>
              <option value="fake_offer_letter">⚠️ Fake Offer Letter / Check Scam</option>
              <option value="advance_fee">💸 Advance Training / Equipment Fee</option>
              <option value="fake_stipend">📉 Unpaid Labor / Ghosted Stipend</option>
              <option value="legit_experience">✅ Confirmed Safe & Legit Experience</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Company / Recruiter Name</label>
              <input type="text" id="post-company" class="form-input" placeholder="e.g., Apex Tech (Impersonating Amazon)" required />
            </div>
            <div class="form-group">
              <label class="form-label">Opportunity Role</label>
              <input type="text" id="post-title" class="form-input" placeholder="e.g., Python Developer Intern" required />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Communication Channel</label>
              <select id="post-channel" class="form-select">
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="Email">Email</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="Official Portal">Official Portal</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Money Demanded / Paid</label>
              <input type="text" id="post-amount" class="form-input" placeholder="e.g., $150 USDT or $0" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Short Summary (One-Liner)</label>
            <input type="text" id="post-summary" class="form-input" placeholder="e.g., Recruiter requested $120 crypto recharge to unlock task commission" required />
          </div>

          <div class="form-group">
            <label class="form-label">Full Experience & Red Flags</label>
            <textarea id="post-detailed" class="form-textarea" rows="4" placeholder="Explain what happened step-by-step to help other students recognize the scheme..." required></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" id="cancel-forum-modal-btn" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Publish Community Report</button>
          </div>
        </form>
      </div>
    </div>
  `;

  setupForumEvents(container);
}

function setupForumEvents(container) {
  const postsMount = container.querySelector("#forum-posts-mount");
  const searchInput = container.querySelector("#forum-search-input");
  const tagChips = container.querySelectorAll("#forum-tag-chips .filter-chip");
  const modal = container.querySelector("#forum-modal");
  const openModalBtn = container.querySelector("#open-new-post-modal-btn");
  const closeModalBtn = container.querySelector("#close-forum-modal-btn");
  const cancelModalBtn = container.querySelector("#cancel-forum-modal-btn");
  const form = container.querySelector("#forum-post-form");

  let currentSearch = "";
  let currentTag = "all";

  async function loadPosts() {
    postsMount.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">Loading community reports...</div>`;
    try {
      const posts = await API.getForumPosts(currentSearch, currentTag);
      renderPosts(posts);
    } catch (err) {
      postsMount.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--risk-danger);">Failed to load forum posts.</div>`;
    }
  }

  function renderPosts(posts) {
    if (!posts || posts.length === 0) {
      postsMount.innerHTML = `
        <div style="text-align: center; padding: 40px; background: var(--bg-input); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle); color: var(--text-muted);">
          <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); margin-bottom: 4px;">No posts match this filter</div>
          <div style="font-size: 0.85rem;">Be the first to share an experience or try another search term!</div>
        </div>
      `;
      return;
    }

    postsMount.innerHTML = posts.map(p => {
      const isLegit = p.risk_level === "SAFE" || p.category === "legit_experience";
      const cardClass = isLegit ? "legit-flagged" : "scam-flagged";
      
      return `
        <div class="forum-card ${cardClass}" data-id="${p.id}">
          <div class="forum-top">
            <div>
              <div class="forum-company">${p.company_name}</div>
              <div style="font-size: 0.84rem; color: var(--brand-cyan); font-weight: 600;">${p.opportunity_title}</div>
            </div>
            <div class="score-badge-pill ${isLegit ? 'safe' : 'danger'}" style="font-size: 0.76rem; padding: 3px 10px;">
              ${isLegit ? '✓ Confirmed Legit' : '⚠️ Reported Scam'}
            </div>
          </div>

          <div class="forum-summary">${p.summary}</div>
          <div class="forum-body">${p.detailed_experience}</div>

          <div class="forum-tags">
            <span class="forum-tag ${isLegit ? 'legit' : ''}">Channel: ${p.communication_channel}</span>
            ${p.requested_amount ? `<span class="forum-tag ${isLegit ? 'legit' : ''}">Amount: ${p.requested_amount}</span>` : ''}
            ${p.tags.map(t => `<span class="forum-tag ${isLegit ? 'legit' : ''}">#${t}</span>`).join("")}
          </div>

          <div class="forum-footer">
            <span>Posted by <strong>${p.author_name}</strong> • ${p.created_at}</span>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button class="upvote-btn" data-id="${p.id}">
                <span>▲ Upvote Helpful</span>
                <span class="upvote-count" style="color: var(--brand-cyan); font-family: var(--font-mono);">${p.upvotes}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Upvote handlers
    postsMount.querySelectorAll(".upvote-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        try {
          const res = await API.upvoteForumPost(id);
          const countSpan = btn.querySelector(".upvote-count");
          if (countSpan) countSpan.textContent = res.upvotes;
          btn.style.borderColor = "var(--risk-safe)";
        } catch (e) {
          console.error(e);
        }
      });
    });
  }

  // Tag filters
  tagChips.forEach(chip => {
    chip.addEventListener("click", () => {
      tagChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentTag = chip.getAttribute("data-tag");
      loadPosts();
    });
  });

  // Search filter
  let searchTimer;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentSearch = e.target.value.trim();
      loadPosts();
    }, 250);
  });

  // Modal interactions
  openModalBtn.addEventListener("click", () => modal.classList.add("open"));
  closeModalBtn.addEventListener("click", () => modal.classList.remove("open"));
  cancelModalBtn.addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });

  // Form Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      company_name: container.querySelector("#post-company").value.trim(),
      opportunity_title: container.querySelector("#post-title").value.trim(),
      category: container.querySelector("#post-category").value,
      communication_channel: container.querySelector("#post-channel").value,
      requested_amount: container.querySelector("#post-amount").value.trim() || "$0",
      summary: container.querySelector("#post-summary").value.trim(),
      detailed_experience: container.querySelector("#post-detailed").value.trim(),
      author_name: "Anonymous Student",
      tags: [container.querySelector("#post-category").value.replace("_", " ")]
    };

    try {
      await API.submitForumPost(payload);
      modal.classList.remove("open");
      form.reset();
      loadPosts();
    } catch (err) {
      alert("Failed to submit post: " + err.message);
    }
  });

  // Initial Load
  loadPosts();
}
