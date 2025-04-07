chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "saveCode") {
    chrome.storage.local.set({ dailyCode: message.code }, () => {
      console.log("Daily code saved:", message.code);
      sendResponse({ status: "success" });
    });
    return true;
  } else if (message.type === "getCode") {
    chrome.storage.local.get("dailyCode", (data) => {
      sendResponse({ code: data.dailyCode || null });
    });
    return true;
  }
});