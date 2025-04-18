chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "saveCode") {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    chrome.storage.local.set({ dailyCode: message.code, dailyCodeDate: currentDate }, () => {
      console.log("Daily code and date saved:", message.code, currentDate);
      sendResponse({ status: "success" });
    });
    return true;
  } else if (message.type === "getCode") {
    chrome.storage.local.get(["dailyCode", "dailyCodeDate"], (data) => {
      sendResponse({ code: data.dailyCode || null, date: data.dailyCodeDate || null });
    });
    return true;
  }
});