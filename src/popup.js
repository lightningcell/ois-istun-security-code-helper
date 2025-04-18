document.getElementById("activeToggle").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  chrome.storage.local.set({ isActive: isChecked }, () => {
    console.log("Active toggle updated:", isChecked);
  });
});

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
document.getElementById("activeInfo").addEventListener("mouseenter", () => {
  document.getElementById("activeTooltip").style.display = "block";
});

document.getElementById("activeInfo").addEventListener("mouseleave", () => {
  document.getElementById("activeTooltip").style.display = "none";
});

document.getElementById("panelInfo").addEventListener("mouseenter", () => {
  document.getElementById("panelTooltip").style.display = "block";
});

document.getElementById("panelInfo").addEventListener("mouseleave", () => {
  document.getElementById("panelTooltip").style.display = "none";
});

// Load the current state of the toggles when the popup is opened
chrome.storage.local.get(["isActive", "redirectToggle", "panelToggle"], (data) => {
  const activeToggle = document.getElementById("activeToggle");
  activeToggle.checked = data.isActive !== false; // Default to true if not set
  
  const redirectToggle = document.getElementById("redirectToggle");
  redirectToggle.checked = data.redirectToggle !== false;
  
  const panelToggle = document.getElementById("panelToggle");
  panelToggle.checked = data.panelToggle === true;
});