document.getElementById("clearCode").addEventListener("click", () => {
  chrome.storage.local.remove("dailyCode", () => {
    alert("Daily code cleared.");
  });
});

document.getElementById("redirectToggle").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  chrome.storage.local.set({ redirectToggle: isChecked }, () => {
    console.log("Redirect toggle updated:", isChecked);
  });
});

// Load the current state of the toggle when the popup is opened
chrome.storage.local.get("redirectToggle", (data) => {
  const toggle = document.getElementById("redirectToggle");
  toggle.checked = data.redirectToggle !== false;
});