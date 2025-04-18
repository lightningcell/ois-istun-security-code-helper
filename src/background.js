chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  // Initialize isActive to true by default
  chrome.storage.local.get("isActive", (data) => {
    if (data.isActive === undefined) {
      chrome.storage.local.set({ isActive: true }, () => {
        console.log("Extension activity set to active by default");
      });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // First check if extension is active
  chrome.storage.local.get("isActive", (data) => {
    const isActive = data.isActive !== false; // Default to true if not set
    
    if (!isActive) {
      // Extension is disabled, don't process messages
      if (message.type === "getCode" || message.type === "checkActive") {
        sendResponse({ isActive: false });
      }
      return;
    }
    
    // Extension is active, process messages normally
    if (message.type === "saveCode") {
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      chrome.storage.local.set({ dailyCode: message.code, dailyCodeDate: currentDate }, () => {
        console.log("Daily code and date saved:", message.code, currentDate);
        sendResponse({ status: "success", isActive: true });
      });
      return true;
    } else if (message.type === "getCode") {
      chrome.storage.local.get(["dailyCode", "dailyCodeDate"], (data) => {
        sendResponse({ code: data.dailyCode || null, date: data.dailyCodeDate || null, isActive: true });
      });
      return true;
    } else if (message.type === "checkActive") {
      sendResponse({ isActive: true });
      return true;
    }
  });
  
  return true; // Keep the message channel open for async response
});