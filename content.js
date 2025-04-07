// Reusable function to show countdown and click a button
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

// Reusable function to handle button click with optional countdown
function clickButtonWithOptionalCountdown(buttonSelector, showCountdown) {
  if (showCountdown) {
    showCountdownAndClickButton(buttonSelector);
  } else {
    document.querySelector(buttonSelector).click();
  }
}

// Add a MutationObserver to handle potential delays in DOM updates
function waitForTextAndClickButton(text, buttonSelector) {
  const observer = new MutationObserver((mutations, obs) => {
    const targetDiv = Array.from(document.querySelectorAll("div"))
      .find(div => div.textContent.includes(text));

    if (targetDiv) {
      console.log("Target div found:", targetDiv.textContent);
      obs.disconnect(); // Stop observing once the target is found
      chrome.storage.local.get("redirectToggle", (data) => {
        const showCountdown = data.redirectToggle !== false; // Default to true if not set
        clickButtonWithOptionalCountdown(buttonSelector, showCountdown);
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (window.location.href.includes("/auth/guvenlik")) {
  chrome.runtime.sendMessage({ type: "getCode" }, (response) => {
    if (response.code) {
      const inputField = document.getElementById("akilli_sifre");
      inputField.type = "text"; // Change input type to text
      inputField.value = response.code;

      chrome.storage.local.get("redirectToggle", (data) => {
        const showCountdown = data.redirectToggle !== false; // Default to true if not set
        clickButtonWithOptionalCountdown("input[type='submit']", showCountdown);
      });
    }
  });

  document.querySelector("input[type='submit']").addEventListener("click", () => {
    const code = document.getElementById("akilli_sifre").value;
    chrome.runtime.sendMessage({ type: "saveCode", code });
  });
} else if (window.location.href === "https://ois.istun.edu.tr/") {
  chrome.storage.local.get("redirectToggle", (data) => {
    const showCountdown = data.redirectToggle !== false; // Default to true if not set
    clickButtonWithOptionalCountdown("input[type='button']", showCountdown);
  });
} else {
  waitForTextAndClickButton("Adres doğrulama resmi.", "input[type='button']");
}