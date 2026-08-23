import { API } from "../api.js";
import { renderRiskGauge } from "./gauge.js";

const PRESET_TEST_CASES = {
  task_scam: {
    label: "🚨 WhatsApp Task & Crypto Scam",
    type: "text",
    text: "Hi! I am Jessica from Amazon Global HR. We noticed your impressive profile and selected you for a remote product optimization role. You can earn $500 per day by rating products and liking YouTube videos for 30 minutes. Direct hiring without interview! Immediate joining. Please message our manager on Telegram @amazon_career_global to claim your bonus. Note: A refundable registration deposit of $100 USDT is required to activate your worker ID."
  },
  spoofed_email: {
    label: "⚠️ Lookalike Google Recruiter",
    type: "text",
    text: "Dear Candidate, We are pleased to offer you the position of Junior Cloud Engineer at Google LLC. Your compensation is $65/hr. Please confirm your acceptance by replying to this email: hr-recruiting@gmai1-support.com or visit http://google-careers-portal.xyz/verify-offer. You must pay a $250 equipment insurance fee before receiving your company MacBook."
  },
  legit_swe: {
    label: "✅ Authentic Google SWE Intern",
    type: "text",
    text: "Hi Alex, Thank you for applying for the Software Engineering Summer Intern 2026 position at Google! We would like to invite you to a 45-minute technical interview with one of our software engineers. You can view your application status and schedule your slot directly through the official Google Careers Portal at https://careers.google.com/jobs/results/. Google never requests payment for interviews, background checks, or equipment."
  },
  unpaid_labor: {
    label: "⚠️ Unpaid SaaS Labor Trap",
    type: "text",
    text: "Urgent hiring for Full Stack Developer Intern at CloudNova Tech! You will build our production frontend and database for real enterprise clients. Unpaid 3-month evaluation period, but top performer gets $3000 stipend afterwards. Immediate joining, only 2 slots left. Apply now!"
  }
};

export function initScanner() {
  const container = document.getElementById("scanner-container");
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card">
      <div class="section-header">
        <div class="section-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Multimodal Authenticity Engine
        </div>
        <h2 class="section-title">Verify Any Internship or Job Opportunity</h2>
        <p class="section-desc">Paste message details, suspicious links, or drag-and-drop chat screenshots to evaluate scam patterns in seconds.</p>
      </div>

      <div class="scanner-grid">
        <!-- Input Column -->
        <div class="scanner-input-col">
          <div class="input-modes-bar">
            <button class="mode-chip active" id="mode-text-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
              Text & Link
            </button>
            <button class="mode-chip" id="mode-image-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              Upload Screenshot
            </button>
          </div>

          <!-- Text Mode Form -->
          <div id="text-mode-section">
            <textarea id="scan-input-text" class="scan-textarea" placeholder="Paste the WhatsApp chat, LinkedIn DM, job description, recruiter email, or suspicious link here..."></textarea>
          </div>

          <!-- Image Dropzone Form -->
          <div id="image-mode-section" style="display: none;">
            <div id="file-dropzone" class="file-dropzone">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" stroke-width="2" style="margin-bottom: 8px;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">Drag & drop chat screenshot or flyer</div>
              <div style="color: var(--text-muted); font-size: 0.8rem;">Supports PNG, JPG, WebP, QR codes</div>
              <input type="file" id="file-input" accept="image/*" style="display: none;" />
              <div id="selected-file-name" style="margin-top: 10px; color: var(--brand-cyan); font-weight: 600; font-size: 0.84rem;"></div>
            </div>
          </div>

          <!-- Scan Action Row -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; flex-wrap: wrap; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-muted); cursor: pointer;">
              <input type="checkbox" id="share-anon-check" checked style="accent-color: var(--brand-primary);" />
              <span>Contribute anonymized signals to student database</span>
            </label>
            <button class="btn-primary" id="run-scan-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span id="scan-btn-label">Run Authenticity Scan</span>
            </button>
          </div>

          <!-- Quick Test Case Presets -->
          <div class="presets-container">
            <div class="presets-label">⚡ One-Click Demo Presets</div>
            <div class="preset-buttons">
              <button class="preset-btn" data-preset="task_scam">${PRESET_TEST_CASES.task_scam.label}</button>
              <button class="preset-btn" data-preset="spoofed_email">${PRESET_TEST_CASES.spoofed_email.label}</button>
              <button class="preset-btn" data-preset="legit_swe">${PRESET_TEST_CASES.legit_swe.label}</button>
              <button class="preset-btn" data-preset="unpaid_labor">${PRESET_TEST_CASES.unpaid_labor.label}</button>
            </div>
          </div>
        </div>

        <!-- Output Result Column -->
        <div class="scanner-output-col">
          <div id="scan-results-box">
            <!-- Initial Empty State -->
            <div style="background: var(--bg-input); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); padding: 40px 24px; text-align: center; color: var(--text-muted);">
              <div style="width: 50px; height: 50px; margin: 0 auto 14px auto; border-radius: 50%; background: rgba(139, 92, 246, 0.1); display: flex; align-items: center; justify-content: center; color: var(--brand-primary);">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 1.05rem; margin-bottom: 4px;">Ready to Analyze</div>
              <div style="font-size: 0.85rem; max-width: 320px; margin: 0 auto;">Select a preset or paste any job offer on the left to view the instant risk gauge & plain-English breakdown.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Event Handlers
  setupScannerEvents(container);
}

function setupScannerEvents(container) {
  const modeTextBtn = container.querySelector("#mode-text-btn");
  const modeImageBtn = container.querySelector("#mode-image-btn");
  const textSection = container.querySelector("#text-mode-section");
  const imageSection = container.querySelector("#image-mode-section");
  const scanInputText = container.querySelector("#scan-input-text");
  const dropzone = container.querySelector("#file-dropzone");
  const fileInput = container.querySelector("#file-input");
  const fileNameDisplay = container.querySelector("#selected-file-name");
  const runScanBtn = container.querySelector("#run-scan-btn");
  const shareAnonCheck = container.querySelector("#share-anon-check");

  let currentMode = "text";
  let selectedFile = null;

  // Toggle Modes
  modeTextBtn.addEventListener("click", () => {
    currentMode = "text";
    modeTextBtn.classList.add("active");
    modeImageBtn.classList.remove("active");
    textSection.style.display = "block";
    imageSection.style.display = "none";
  });

  modeImageBtn.addEventListener("click", () => {
    currentMode = "image";
    modeImageBtn.classList.add("active");
    modeTextBtn.classList.remove("active");
    textSection.style.display = "none";
    imageSection.style.display = "block";
  });

  // File Dropzone Handlers
  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      selectedFile = e.target.files[0];
      fileNameDisplay.textContent = `Selected: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`;
    }
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      selectedFile = e.dataTransfer.files[0];
      fileNameDisplay.textContent = `Selected: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`;
    }
  });

  // Preset Buttons
  container.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const presetKey = btn.getAttribute("data-preset");
      const preset = PRESET_TEST_CASES[presetKey];
      if (preset) {
        modeTextBtn.click();
        scanInputText.value = preset.text;
        triggerScan();
      }
    });
  });

  // Run Scan Trigger
  runScanBtn.addEventListener("click", triggerScan);

  async function triggerScan() {
    const textVal = scanInputText.value.trim();
    if (currentMode === "text" && !textVal) {
      alert("Please paste text, links, or select a preset to analyze.");
      return;
    }
    if (currentMode === "image" && !selectedFile && !textVal) {
      alert("Please select a screenshot image to analyze.");
      return;
    }

    const btnLabel = container.querySelector("#scan-btn-label");
    btnLabel.textContent = "Analyzing Signals...";
    runScanBtn.disabled = true;

    try {
      let result;
      if (currentMode === "image" && selectedFile) {
        result = await API.uploadScanFile(selectedFile, shareAnonCheck.checked);
      } else {
        result = await API.scanContent({
          content_type: "text",
          text: textVal,
          share_anonymously: shareAnonCheck.checked
        });
      }

      displayScanResult(result);
    } catch (err) {
      console.error(err);
      alert("Scan failed: " + err.message);
    } finally {
      btnLabel.textContent = "Run Authenticity Scan";
      runScanBtn.disabled = false;
    }
  }

  function displayScanResult(res) {
    const resultsBox = container.querySelector("#scan-results-box");
    let cardThemeClass = "safe";
    if (res.risk_score >= 70 || res.risk_level === "HIGH_RISK") cardThemeClass = "danger";
    else if (res.risk_score >= 30 || res.risk_level === "CAUTION") cardThemeClass = "caution";

    let flagsHtml = "";
    if (res.red_flags && res.red_flags.length > 0) {
      flagsHtml += res.red_flags.map(f => `
        <div class="flag-item red">
          <div class="flag-icon">⚠️</div>
          <div>
            <div class="flag-title">${f.title}</div>
            <div class="flag-desc">${f.description}</div>
          </div>
        </div>
      `).join("");
    }

    if (res.green_flags && res.green_flags.length > 0) {
      flagsHtml += res.green_flags.map(f => `
        <div class="flag-item green">
          <div class="flag-icon">✅</div>
          <div>
            <div class="flag-title">${f.title}</div>
            <div class="flag-desc">${f.description}</div>
          </div>
        </div>
      `).join("");
    }

    let adviceHtml = "";
    if (res.action_advice && res.action_advice.length > 0) {
      adviceHtml = `
        <div class="advice-box">
          <div class="advice-title">Recommended Student Next Steps</div>
          <ul class="advice-list">
            ${res.action_advice.map(a => `<li>${a}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    resultsBox.innerHTML = `
      <div class="score-card ${cardThemeClass}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-subtle); text-transform: uppercase;">Scan Report ID: ${res.id}</span>
          ${res.company_detected ? `<span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-cyan); background: var(--brand-cyan-glow); padding: 3px 8px; border-radius: 6px;">Entity: ${res.company_detected}</span>` : ''}
        </div>

        <div id="gauge-mount-point" class="gauge-wrapper"></div>

        <div style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-top: 8px; text-align: center;">
          ${res.title}
        </div>
        <p style="font-size: 0.88rem; color: var(--text-muted); text-align: center; margin: 4px 0 16px 0;">
          ${res.summary}
        </p>

        <div class="flag-list">
          ${flagsHtml}
        </div>

        ${adviceHtml}

        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn-secondary" id="discuss-forum-btn" style="font-size: 0.82rem; padding: 8px 14px;">
            💬 Search Forum Discussions
          </button>
        </div>
      </div>
    `;

    // Render animated gauge
    const gaugeMount = resultsBox.querySelector("#gauge-mount-point");
    if (gaugeMount) {
      renderRiskGauge(res.risk_score, res.risk_level, gaugeMount);
    }

    // Discuss in forum button hook
    const discussBtn = resultsBox.querySelector("#discuss-forum-btn");
    if (discussBtn) {
      discussBtn.addEventListener("click", () => {
        const forumNav = document.querySelector('[data-tab="forum"]');
        if (forumNav) forumNav.click();
      });
    }
  }
}
