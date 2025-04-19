// This file is responsible for injecting custom themes based on URL patterns
(() => {
  // Check if theme feature is enabled
  chrome.storage.local.get("themeToggle", (data) => {
    const isThemeEnabled = data.themeToggle === true;

    if (!isThemeEnabled) {
      console.log("Custom theme is disabled. Not injecting styles.");
      return;
    }

    // Map URLs to CSS files
    const urlThemeMap = [
      {
        urlPattern: "/auth/login",
        cssFile: "login.css",
      },
      {
        urlPattern: "/auth/guvenlik",
        cssFile: "daily_code.css",
      }
      // Add more mappings here for other pages
      // Example: { urlPattern: "/student/dashboard", cssFile: "dashboard.css" }
    ];

    // Find matching CSS for current URL
    const currentUrl = window.location.href;
    const matchingTheme = urlThemeMap.find((theme) =>
      currentUrl.includes(theme.urlPattern)
    );

    if (matchingTheme) {
      console.log(
        `Injecting custom theme: ${matchingTheme.cssFile} for URL: ${currentUrl}`
      );
      injectStylesheet(matchingTheme.cssFile);
    } else {
      console.log(`No custom theme found for URL: ${currentUrl}`);
    }
  });

  // Function to inject CSS file
  function injectStylesheet(cssFileName) {
    // Fetch the CSS file
    fetch(chrome.runtime.getURL(`style/${cssFileName}`))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load CSS file: ${cssFileName}`);
        }
        return response.text();
      })
      .then((cssText) => {
        // Create style element
        const styleElement = document.createElement("style");
        styleElement.id = `custom-theme-${cssFileName.replace(".css", "")}`;
        styleElement.textContent = cssText;

        // Insert into document
        document.head.appendChild(styleElement);
        console.log(`Successfully injected theme: ${cssFileName}`);
      })
      .catch((error) => {
        console.error("Error injecting theme:", error);
      });
  }
})();
