document.getElementById("redirectToggle").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  chrome.storage.local.set({ redirectToggle: isChecked }, () => {
    console.log("Redirect toggle updated:", isChecked);
  });
});

document.getElementById("panelToggle").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  chrome.storage.local.set({ panelToggle: isChecked }, () => {
    console.log("Panel toggle updated:", isChecked);
  });
});

// Tooltip functionality
document.getElementById("panelInfo").addEventListener("mouseenter", () => {
  document.getElementById("panelTooltip").style.display = "block";
});

document.getElementById("panelInfo").addEventListener("mouseleave", () => {
  document.getElementById("panelTooltip").style.display = "none";
});

// Load the current state of the toggles when the popup is opened
chrome.storage.local.get(["redirectToggle", "panelToggle"], (data) => {
  const redirectToggle = document.getElementById("redirectToggle");
  redirectToggle.checked = data.redirectToggle !== false;
  
  const panelToggle = document.getElementById("panelToggle");
  panelToggle.checked = data.panelToggle === true;
});