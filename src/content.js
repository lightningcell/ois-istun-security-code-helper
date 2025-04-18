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
      chrome.storage.local.get("redirectToggle", (data) => {
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

if (window.location.href.includes("/auth/guvenlik")) {
  chrome.runtime.sendMessage({ type: "getCode" }, (response) => {
    if (response.code && response.date) {
      const savedDate = response.date;
      const currentDate = getCurrentDate();

      if (savedDate === currentDate) {
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
    }
  });

  document.querySelector("input[type='submit']").addEventListener("click", () => {
    const code = document.getElementById("akilli_sifre").value;
    const currentDate = getCurrentDate();
    chrome.runtime.sendMessage({ type: "saveCode", code, date: currentDate });
  });
}
else if (window.location.href === "https://ois.istun.edu.tr/") {
  waitForTextAndClickButton("Adres doğrulama resmi.", "input[type='button']");
}
