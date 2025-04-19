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

// Function to check if the current page has an error message
function hasErrorMessage() {
  const errorMessages = Array.from(document.querySelectorAll("p"));
  return errorMessages.some(p => p.textContent.includes("Şifreyi yanlış girdiniz."));
}

// First check if extension is active before running any actions
chrome.runtime.sendMessage({ type: "checkActive" }, (response) => {
  if (response && response.isActive === false) {
    console.log("Extension is currently disabled");
    return; // Exit if extension is not active
  }

  // Check for pending code validation
  chrome.storage.local.get(["pendingSecurityCode", "securityCode", "securityCodeValidated"], (data) => {
    // Check if there's a manually edited code that needs validation
    if (data.securityCode && data.securityCodeValidated !== true) {
      console.log("Found manually edited security code that needs validation");
      // Store it as pending
      chrome.storage.local.set({ 
        pendingSecurityCode: data.securityCode,
        // Mark as needing validation
        securityCodeValidated: false
      });
    }
    
    if (data.pendingSecurityCode) {
      console.log("Found pending security code to validate");
      
      // We're on the security code page
      if (window.location.href.includes("/auth/guvenlik")) {
        // Check if there's an error message indicating wrong code
        if (hasErrorMessage()) {
          console.log("Wrong security code detected. Clearing pending code.");
          chrome.storage.local.remove("pendingSecurityCode");
        } else {
          // We're on the security code page but no error - user probably just navigated here
          // We'll try to validate this code by entering it
          const inputField = document.getElementById("akilli_sifre");
          if (inputField) {
            inputField.type = "text";
            inputField.value = data.pendingSecurityCode;
          }
        }
      } 
      // We're on the address verification page - code was correct
      else if (window.location.href === "https://ois.istun.edu.tr/") {
        console.log("Security code was correct. Saving to permanent storage.");
        // Save the code permanently
        const pendingCode = data.pendingSecurityCode;
        const currentDate = getCurrentDate();
        chrome.runtime.sendMessage({
          type: "saveCode",
          code: pendingCode,
          date: currentDate
        });
        // Mark the code as validated
        chrome.storage.local.set({ securityCodeValidated: true });
        // Clear the pending status
        chrome.storage.local.remove("pendingSecurityCode");
      }
    }
  });
  
  if (window.location.href.includes("/auth/guvenlik")) {
    chrome.runtime.sendMessage({ type: "getCode" }, (response) => {
      // If extension isn't active, skip all processing
      if (response && response.isActive === false) {
        console.log("Extension is currently disabled");
        return;
      }
      
      // Only use a code if it exists and is marked as validated or current
      if (response && response.code && response.date) {
        const savedDate = response.date;
        const currentDate = getCurrentDate();
        const isCurrent = savedDate === currentDate;
        
        chrome.storage.local.get("securityCodeValidated", (validData) => {
          const isValidated = validData.securityCodeValidated === true;
          
          // Only use the code if it's either validated or we're just displaying it
          if (isValidated || isCurrent) {
            // Check panel toggle setting
            chrome.storage.local.get("panelToggle", (data) => {
              const showPanel = data.panelToggle !== false; // Default to true if not set
              
              if (showPanel) {
                // Show panel and don't auto-fill if panel toggle is enabled
                showSecurityCodePanel(response.code, isCurrent);
              } else if (isCurrent && isValidated) {
                // Auto-fill and submit if code is current, validated, and panel toggle is disabled
                const inputField = document.getElementById("akilli_sifre");
                inputField.type = "text";
                inputField.value = response.code;

                chrome.storage.local.get("redirectToggle", (data) => {
                  const showCountdown = data.redirectToggle !== false;
                  clickButtonWithOptionalCountdown("input[type='submit']", showCountdown);
                });
              } else if (isCurrent) {
                // If code is current but not validated, let's enter it but without auto-submit
                // This gives a chance to validate manually entered codes
                console.log("Current code needs validation. Entering it but not auto-submitting.");
                const inputField = document.getElementById("akilli_sifre");
                inputField.type = "text";
                inputField.value = response.code;
                // Store as pending for validation
                chrome.storage.local.set({ 
                  pendingSecurityCode: response.code
                });
              } else {
                console.log("The saved code is outdated and will not be auto-filled.");
              }
            });
          } else {
            console.log("Code exists but needs validation before auto-submitting.");
            // Store as pending for validation
            chrome.storage.local.set({ 
              pendingSecurityCode: response.code,
              // Mark as needing validation  
              securityCodeValidated: false
            });
            // Enter the code but don't submit automatically
            const inputField = document.getElementById("akilli_sifre");
            if (inputField) {
              inputField.type = "text";
              inputField.value = response.code;
            }
          }
        });
      }
    });

    // Add event listener to the form submission
    document.querySelector("form").addEventListener("submit", () => {
      chrome.runtime.sendMessage({ type: "checkActive" }, (response) => {
        if (response && response.isActive !== false) {
          // Store the entered code as pending in chrome.storage
          const enteredCode = document.getElementById("akilli_sifre").value;
          console.log("Storing pending security code:", enteredCode);
          chrome.storage.local.set({ 
            pendingSecurityCode: enteredCode,
            // Mark as needing validation
            securityCodeValidated: false
          });
        }
      });
    });
  }
  else if (window.location.href === "https://ois.istun.edu.tr/") {
    waitForTextAndClickButton("Adres doğrulama resmi.", "input[type='button']");
  }
});
