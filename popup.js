/**
 * ScamX Popup Script
 */

document.addEventListener("DOMContentLoaded", async () => {
  const input = document.getElementById("popup-input");
  const scanBtn = document.getElementById("popup-scan-btn");
  const resultArea = document.getElementById("popup-result-area");
  const emptyState = document.getElementById("popup-empty-state");

  const scoreVal = document.getElementById("popup-score-val");
  const scoreBadge = document.getElementById("popup-score-badge");
  const riskLabel = document.getElementById("popup-risk-level-label");
  const title = document.getElementById("popup-result-title");
  const desc = document.getElementById("popup-result-summary");
  const flagsList = document.getElementById("popup-flags-list");

  // Check if there is a cached last scan in chrome.storage
  if (window.chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["last_scan"], (data) => {
      if (data.last_scan) {
        displayPopupResult(data.last_scan);
      }
    });
  }

  scanBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) {
      alert("Please paste text or a link to scan.");
      return;
    }

    scanBtn.textContent = "Scanning...";
    scanBtn.disabled = true;

    try {
      const res = await fetch("http://localhost:8000/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "text",
          text: text,
          share_anonymously: true
        })
      });

      if (!res.ok) throw new Error("Server error");
      const scanData = await res.json();
      displayPopupResult(scanData);

      if (window.chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ last_scan: scanData });
      }
    } catch (err) {
      alert("Could not reach ScamX API. Ensure backend is running on port 8000.");
    } finally {
      scanBtn.textContent = "⚡ Scan with ScamX";
      scanBtn.disabled = false;
    }
  });

  function displayPopupResult(data) {
    resultArea.style.display = "block";
    emptyState.style.display = "none";

    scoreVal.textContent = data.risk_score;
    title.textContent = data.title;
    desc.textContent = data.summary;

    scoreBadge.className = "risk-pill";
    if (data.risk_score >= 70) {
      scoreBadge.classList.add("danger");
      riskLabel.textContent = "High Risk Scam";
      riskLabel.style.color = "var(--risk-danger)";
    } else if (data.risk_score >= 30) {
      scoreBadge.classList.add("caution");
      riskLabel.textContent = "Caution";
      riskLabel.style.color = "var(--risk-caution)";
    } else {
      scoreBadge.classList.add("safe");
      riskLabel.textContent = "Low Risk / Verified";
      riskLabel.style.color = "var(--risk-safe)";
    }

    if (data.red_flags && data.red_flags.length > 0) {
      flagsList.innerHTML = data.red_flags.slice(0, 2).map(f => `
        <div class="flag-item-mini">
          ⚠️ <strong>${f.title}</strong>: ${f.description.slice(0, 90)}...
        </div>
      `).join("");
    } else {
      flagsList.innerHTML = `<div style="font-size: 11px; color: var(--risk-safe);">✓ No immediate scam patterns found.</div>`;
    }
  }
});
