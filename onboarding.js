import { API } from "../api.js";

export function initOnboarding() {
  const hasOnboarded = localStorage.getItem("scamx_onboarded");
  if (hasOnboarded) return;

  const modal = document.createElement("div");
  modal.id = "onboarding-modal";
  modal.className = "modal-backdrop open";

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 500px; text-align: center;">
      <div class="logo-badge" style="margin: 0 auto 16px auto; width: 48px; height: 48px; font-size: 1.5rem;">
        ⚡
      </div>
      <div class="section-tag" style="margin-bottom: 8px;">Welcome to ScamX</div>
      <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: 6px;">Protect Your Career Journey</h2>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 20px;">
        Tell us a bit about your target roles so our AI can highlight relevant verified opportunities and guard you against scams.
      </p>

      <form id="onboarding-form" style="text-align: left;">
        <div class="form-group">
          <label class="form-label">Field of Study / Primary Interest</label>
          <select id="onboarding-major" class="form-select">
            <option value="Computer Science">Computer Science & Software Engineering</option>
            <option value="Product Design">Product & UI/UX Design</option>
            <option value="Data Science">Data Science & AI/ML</option>
            <option value="Business & Marketing">Business, Marketing & Finance</option>
            <option value="General STEM">General STEM & Research</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Preferred Location</label>
          <select id="onboarding-location" class="form-select">
            <option value="Global / Remote">Remote (Global)</option>
            <option value="United States">United States</option>
            <option value="India">India</option>
            <option value="Europe / UK">Europe / UK</option>
            <option value="Canada">Canada</option>
          </select>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
          <button type="button" id="skip-onboarding-btn" style="background: transparent; border: none; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; cursor: pointer;">
            Skip for now
          </button>
          <button type="submit" class="btn-primary" style="padding: 10px 22px;">
            Get Started 🚀
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector("#onboarding-form");
  const skipBtn = modal.querySelector("#skip-onboarding-btn");

  const finishOnboarding = async (major = "Computer Science", location = "Global") => {
    localStorage.setItem("scamx_onboarded", "true");
    try {
      await API.saveUserProfile({
        user_id: "demo_student",
        name: "Alex Rivera",
        major: major,
        interests: [major],
        location: location,
        watched_companies: ["Google", "Linear", "Canva"]
      });
    } catch (e) {
      console.warn("Could not save profile remotely:", e);
    }
    modal.classList.remove("open");
    modal.remove();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const major = modal.querySelector("#onboarding-major").value;
    const location = modal.querySelector("#onboarding-location").value;
    finishOnboarding(major, location);
  });

  skipBtn.addEventListener("click", () => finishOnboarding());
}
