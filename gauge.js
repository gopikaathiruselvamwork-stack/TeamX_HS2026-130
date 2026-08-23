/**
 * ScamX Radial Score Gauge Component
 * Renders an animated SVG arc gauge with semantic color mapping and accessible shield icons.
 */

export function renderRiskGauge(score, riskLevel, containerElement) {
  // Clamp score
  const safeScore = Math.max(0, Math.min(100, score));
  
  // Color & Icon mapping based on traffic-light semantics
  let color = "#10B981"; // Safe Green
  let glowColor = "rgba(16, 185, 129, 0.35)";
  let badgeClass = "safe";
  let label = "Low Risk / Verified";
  let iconSvg = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>`;

  if (safeScore >= 70 || riskLevel === "HIGH_RISK") {
    color = "#EF4444"; // Danger Red
    glowColor = "rgba(239, 68, 68, 0.4)";
    badgeClass = "danger";
    label = "High Risk / Scam Detected";
    iconSvg = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>`;
  } else if (safeScore >= 30 || riskLevel === "CAUTION") {
    color = "#F59E0B"; // Caution Amber
    glowColor = "rgba(245, 158, 11, 0.35)";
    badgeClass = "caution";
    label = "Caution / Mixed Signals";
    iconSvg = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`;
  }

  // SVG Gauge calculations (semi-circle radius 75)
  const radius = 75;
  const circumference = Math.PI * radius; // 180 degree arc
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  containerElement.innerHTML = `
    <div class="gauge-component" style="text-align: center; position: relative; width: 220px; margin: 0 auto;">
      <svg width="220" height="135" viewBox="0 0 220 135">
        <!-- Background Track -->
        <path d="M 25 115 A 75 75 0 0 1 195 115"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              stroke-width="14"
              stroke-linecap="round" />
        
        <!-- Animated Active Arc -->
        <path id="gauge-progress-arc"
              d="M 25 115 A 75 75 0 0 1 195 115"
              fill="none"
              stroke="${color}"
              stroke-width="14"
              stroke-linecap="round"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${circumference}"
              style="transition: stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease; filter: drop-shadow(0 0 8px ${glowColor});" />
      </svg>
      
      <!-- Central Score Readout -->
      <div style="position: absolute; top: 52px; left: 0; right: 0; display: flex; flex-direction: column; align-items: center;">
        <div style="font-family: var(--font-display); font-size: 2.3rem; font-weight: 800; color: ${color}; line-height: 1;" id="gauge-score-num">
          0
        </div>
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">
          Risk Index / 100
        </div>
      </div>
      
      <!-- Accessible Shield Status Badge -->
      <div class="score-badge-pill ${badgeClass}" style="margin-top: 8px; display: inline-flex; align-items: center; gap: 6px;">
        ${iconSvg}
        <span>${label}</span>
      </div>
    </div>
  `;

  // Animate the arc and number smoothly
  requestAnimationFrame(() => {
    const arc = containerElement.querySelector("#gauge-progress-arc");
    const num = containerElement.querySelector("#gauge-score-num");
    if (arc) {
      arc.style.strokeDashoffset = strokeDashoffset;
    }
    
    // Animate number counting up
    let current = 0;
    const duration = 800;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = safeScore / steps;
    
    const counter = setInterval(() => {
      current += increment;
      if (current >= safeScore) {
        current = safeScore;
        clearInterval(counter);
      }
      if (num) num.textContent = Math.round(current);
    }, stepTime);
  });
}
