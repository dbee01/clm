document.addEventListener("DOMContentLoaded", function () {
  const logContainer = document.getElementById("global-log");

  // Get a basic user identifier (replace this with real logic if needed)
  const user = "User123";

  function logEvent(type, details) {
    const timestamp = new Date().toLocaleString();
    const logLine = `${timestamp} | ${user} | ${type} | ${details}`;
    const lineElem = document.createElement("div");
    lineElem.textContent = logLine;
    logContainer.appendChild(lineElem);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  // Link clicks (website)
  document.querySelectorAll("a.website-link").forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      const name = link.closest("tr")?.getAttribute("data-key") || "Unknown";
      logEvent("Website Click", `${name} → ${href}`);
    });
  });

  // Phone link clicks
  document.querySelectorAll("a.phone-link").forEach(link => {
    link.addEventListener("click", e => {
      const number = link.getAttribute("href");
      const name = link.closest("tr")?.getAttribute("data-key") || "Unknown";
      logEvent("Phone Click", `${name} → ${number}`);
    });
  });

  // Dropdown menu changes
  document.querySelectorAll("select.status-select").forEach(select => {
    select.addEventListener("change", e => {
      const selected = select.value;
      const name = select.closest("tr")?.getAttribute("data-key") || "Unknown";
      logEvent("Status Change", `${name} → ${selected}`);
    });
  });

  // Log text input return (Enter key)
  document.querySelectorAll("input.log-input").forEach(input => {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        const text = input.value.trim();
        if (text !== "") {
          const name = input.closest("tr")?.getAttribute("data-key") || "Unknown";
          logEvent("Log Input", `${name} → "${text}"`);
          input.value = ""; // Clear input
        }
      }
    });
  });

});

