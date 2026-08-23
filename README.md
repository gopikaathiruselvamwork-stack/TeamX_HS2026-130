# ScamX — Dual-Surface Opportunity Scam Detection & AI Career Platform

ScamX is an AI-powered verification platform designed to protect students from fraudulent internship and job offers across WhatsApp, LinkedIn, email, and social media.

---

## ⚡ Key Highlights & Core Features

1. **Multimodal Authenticity Scanner**
   - Analyzes pasted text, job links, chat screenshots, and QR codes.
   - Detects lookalike domains (e.g. `gmai1-support.com`, `google-careers-portal.xyz`), upfront fee traps, Telegram/WhatsApp text interview requests, and artificial urgency.
   - Outputs a 0–100 animated radial risk gauge mapped strictly to Traffic-Light semantics: **Green (Low Risk / Verified)**, **Amber (Caution / Mixed Signals)**, **Red (High Risk Scam)**.

2. **AI Career Assistant with Scam Guardrails**
   - Interactive technical and behavioral mock interviews with STAR framework guidance.
   - Resume impact analysis and tailored internship discovery.
   - **System-level guardrail**: Automatically hands off verification inquiries (e.g., *"Is this WhatsApp recruiter legit?"*) directly to the authenticity engine rather than hallucinating.

3. **Verified Opportunities Feed**
   - Proactively vetted listings with verified company domains, authenticated ATS platforms (Greenhouse, Lever, Ashby), transparent stipends, and direct official career links.
   - Real-time filters by role (Engineering, Design, Data) and workplace (Remote, Hybrid, On-site).

4. **Peer Scam Intelligence Forum**
   - Real students reporting fraudulent experiences, fake offer letters, and task scams.
   - Structured categories, tags (`#task scam`, `#advance fee`, `#fake offer letter`), upvoting, and moderation.

5. **Browser Extension (Manifest V3)**
   - Right-click context menus: *"Check selected text with ScamX"*, *"Check link with ScamX"*, *"Check image with ScamX"*.
   - Compact dark-mode popup with instant risk score gauge and 1-click deep links to the full web dashboard.

---

## 🛠️ Architecture & Technology Stack

- **Backend**: FastAPI (Python 3.14) with SQLite persistent database.
- **Frontend**: Responsive Single-Page Web App built with tokenized modern CSS, dark-mode glassmorphism, animated SVG radial gauges, and modular ES6 JavaScript.
- **Extension**: Chrome/Edge Manifest V3 background service worker, in-page content script tooltips, and interactive popup UI.

---

## 🚀 Running the Project

### 1. Start Backend API & Web Server
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

### 2. Load the Browser Extension
1. Open Google Chrome or Microsoft Edge and navigate to `chrome://extensions` or `edge://extensions`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the `extension` folder located in this repository:
   ```
   c:\Users\Admin\Desktop\Scam detector\extension
   ```
4. Right-click any text or link on any webpage (Gmail, WhatsApp Web, LinkedIn) and select **"Check selected text with ScamX"**!

### 3. Run Automated Test Suite
```powershell
python tests/test_backend.py
python tests/test_e2e_http.py
```
