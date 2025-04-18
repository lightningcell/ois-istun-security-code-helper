function showCountdownAndClickButton(buttonSelector) {
  const countdownElement = document.createElement("div");
  countdownElement.id = "countdown";
  countdownElement.className = "countdown-style";
  document.body.appendChild(countdownElement);

  let countdown = 3;
  countdownElement.textContent = `Redirecting in ${countdown}...`;

  const interval = setInterval(() => {
    countdown -= 1;
    if (countdown > 0) {
      countdownElement.textContent = `Redirecting in ${countdown}...`;
    } else {
      clearInterval(interval);
      countdownElement.remove();
      document.querySelector(buttonSelector).click();
    }
  }, 1000);
}


function clickButtonWithOptionalCountdown(buttonSelector, showCountdown) {
  if (showCountdown) {
    showCountdownAndClickButton(buttonSelector);
  } else {
    document.querySelector(buttonSelector).click();
  }
}


function waitForTextAndClickButton(text, buttonSelector) {
  const observer = new MutationObserver((mutations, obs) => {
    const targetDiv = Array.from(document.querySelectorAll("div"))
      .find(div => div.textContent.includes(text));

    if (targetDiv) {
      observer.disconnect(); // Stop observing once the target is found
      chrome.storage.local.get(["redirectToggle", "isActive"], (data) => {
        const isActive = data.isActive !== false; // Default to true if not set
        if (!isActive) return; // Skip if extension is not active

        const showCountdown = data.redirectToggle !== false; // Default to true if not set
        clickButtonWithOptionalCountdown(buttonSelector, showCountdown);
        console.debug("Target div found and button clicked:", targetDiv.textContent);
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function showCopiedTooltip(element, code) {
  // Copy to clipboard
  navigator.clipboard.writeText(code).then(() => {
    // Create and show tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = "Kopyalandı!";
    
    // Position the tooltip near the element
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 5}px`;
    tooltip.style.left = `${rect.left + rect.width/2}px`;
    tooltip.style.transform = "translateX(-50%)";
    
    // Add to DOM and show
    document.body.appendChild(tooltip);
    setTimeout(() => tooltip.classList.add("visible"), 10);
    
    // Remove after a delay
    setTimeout(() => {
      tooltip.classList.remove("visible");
      setTimeout(() => tooltip.remove(), 300);
    }, 1500);
  });
}

function showSecurityCodePanel(code, isCurrent) {
  const panelElement = document.createElement("div");
  panelElement.id = "securityCodePanel";
  panelElement.className = `code-panel ${isCurrent ? 'panel-current' : 'panel-old'}`;
  
  // Create code text element
  const codeTextElement = document.createElement("div");
  const statusText = isCurrent ? "Güncel Kod:" : "Eski Kod:";
  codeTextElement.textContent = `${statusText} ${code}`;
  panelElement.appendChild(codeTextElement);
  
  // Create and add the appropriate icon based on whether the code is current or old
  const iconElement = document.createElement("div");
  iconElement.className = `panel-icon ${isCurrent ? 'copy-icon' : 'refresh-icon'}`;
  
  if (isCurrent) {
    // For current code: Copy to clipboard when clicked
    iconElement.addEventListener("click", (e) => {
      e.stopPropagation();
      showCopiedTooltip(iconElement, code);
    });
    
    // Also make the entire panel clickable for copying
    panelElement.style.cursor = "pointer";
    panelElement.addEventListener("click", () => {
      showCopiedTooltip(panelElement, code);
    });
  } else {
    // For old code: Click the "Yeni Günlük Şifre İstiyorum" link
    iconElement.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // Find the link by its text content
      const refreshLink = Array.from(document.querySelectorAll("a")).find(
        a => a.textContent.includes("Yeni Günlük Şifre İstiyorum")
      );
      
      if (refreshLink) {
        refreshLink.click();
      }
    });
  }
  
  panelElement.appendChild(iconElement);
  
  // Add panel to the page
  document.body.appendChild(panelElement);
}

// First check if extension is active before running any actions
chrome.runtime.sendMessage({ type: "checkActive" }, (response) => {
  if (response && response.isActive === false) {
    console.log("Extension is currently disabled");
    return; // Exit if extension is not active
  }
  
  if (window.location.href.includes("/auth/guvenlik")) {
    chrome.runtime.sendMessage({ type: "getCode" }, (response) => {
      // If extension isn't active, skip all processing
      if (response && response.isActive === false) {
        console.log("Extension is currently disabled");
        return;
      }
      
      if (response && response.code && response.date) {
        const savedDate = response.date;
        const currentDate = getCurrentDate();
        const isCurrent = savedDate === currentDate;

        // Check panel toggle setting
        chrome.storage.local.get("panelToggle", (data) => {
          const showPanel = data.panelToggle !== false; // Default to true if not set
          
          if (showPanel) {
            // Show panel and don't auto-fill if panel toggle is enabled
            showSecurityCodePanel(response.code, isCurrent);
          } else if (isCurrent) {
            // Auto-fill and submit if code is current and panel toggle is disabled
            const inputField = document.getElementById("akilli_sifre");
            inputField.type = "text";
            inputField.value = response.code;

            chrome.storage.local.get("redirectToggle", (data) => {
              const showCountdown = data.redirectToggle !== false;
              clickButtonWithOptionalCountdown("input[type='submit']", showCountdown);
            });
          } else {
            console.log("The saved code is outdated and will not be auto-filled.");
          }
        });
      }
    });

    // Only add these event listeners if the extension is active
    document.querySelector("input[type='submit']").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "checkActive" }, (response) => {
        if (response && response.isActive !== false) {
          const code = document.getElementById("akilli_sifre").value;
          const currentDate = getCurrentDate();
          chrome.runtime.sendMessage({ type: "saveCode", code, date: currentDate });
        }
      });
    });
  }
  else if (window.location.href === "https://ois.istun.edu.tr/") {
    waitForTextAndClickButton("Adres doğrulama resmi.", "input[type='button']");
  }
});
