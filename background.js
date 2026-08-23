/**
 * ScamX Extension Background Service Worker
 * Handles context menus, background scanning, badge updates, and popup communication.
 */

chrome.runtime.onInstalled.addListener(() => {
  // Create Context Menus
  chrome.contextMenus.create({
    id: "scamx_verify_selection",
    title: "🛡️ Check selected text with ScamX",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "scamx_verify_link",
    title: "🛡️ Check link safety with ScamX",
    contexts: ["link"]
  });

  chrome.contextMenus.create({
    id: "scamx_verify_image",
    title: "🛡️ Check image / flyer with ScamX",
    contexts: ["image"]
  });
});

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let scanPayload = {
    content_type: "text",
    text: "",
    url: "",
    share_anonymously: true,
    user_id: "demo_student"
  };

  if (info.menuItemId === "scamx_verify_selection" && info.selectionText) {
    scanPayload.text = info.selectionText;
  } else if (info.menuItemId === "scamx_verify_link" && info.linkUrl) {
    scanPayload.content_type = "url";
    scanPayload.url = info.linkUrl;
  } else if (info.menuItemId === "scamx_verify_image" && info.srcUrl) {
    scanPayload.content_type = "image";
    scanPayload.text = `Image check for: ${info.srcUrl}`;
  }

  try {
    const res = await fetch("http://localhost:8000/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scanPayload)
    });
    
    if (res.ok) {
      const scanResult = await res.json();
      
      // Store in extension sync/local storage for popup
      chrome.storage.local.set({ last_scan: scanResult });

      // Update badge
      const score = scanResult.risk_score;
      chrome.action.setBadgeText({ text: `${score}` });
      if (score >= 70) {
        chrome.action.setBadgeBackgroundColor({ color: "#EF4444" });
      } else if (score >= 30) {
        chrome.action.setBadgeBackgroundColor({ color: "#F59E0B" });
      } else {
        chrome.action.setBadgeBackgroundColor({ color: "#10B981" });
      }

      // Notify content script in current tab
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: "SHOW_SCAN_TOOLTIP",
          result: scanResult
        }).catch(() => {
          // Tab might not have content script ready, safe to ignore
        });
      }
    }
  } catch (err) {
    console.error("ScamX background scan error:", err);
  }
});
