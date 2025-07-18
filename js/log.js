document.addEventListener("DOMContentLoaded", function () {

  const logContainer = document.getElementById("global-log");

  // Helper to get current username from input
  function getCurrentUser() {
    const input = document.getElementById("username-input");
    return input && input.value ? input.value : "User";
  }

  document.querySelectorAll("a.email-link").forEach(link => {
    link.addEventListener("contextmenu", e => {
      const row = link.closest("tr");
      const name = row?.getAttribute("data-key") || "Unknown";
      // You can log this as a special event
      logEvent("Email Icon Right-Click", `${name} → ${link.href}`);
    });
  });

  // Log event with GMT timestamp and current username
  function logEvent(type, details, rowElem) {
    const now = new Date();
    const timestamp = now.toISOString().replace("T", " ").replace("Z", " GMT");
    const user = getCurrentUser();
    const logLine = `${timestamp} | ${user} | ${type} | ${details}`;
    const lineElem = document.createElement("div");
    lineElem.textContent = logLine;
    logContainer.appendChild(lineElem);
    logContainer.scrollTop = logContainer.scrollHeight;

    // If this is a Log Input event, also add to the rows log notes div
    if (type === "Log Input" && rowElem) {
      const notesDiv = rowElem.querySelector('.row-log-notes');
      if (notesDiv) {
        const noteElem = document.createElement("div");
        noteElem.textContent = `${timestamp}: ${details}`;
        notesDiv.appendChild(noteElem);
      }
    }

    // Save log notes to localStorage whenever they change
    saveLogNotes();
  }

  // Link clicks (website)
  document.querySelectorAll("a.website-link").forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      const row = link.closest("tr");
      const name = row?.getAttribute("data-key") || "Unknown";
      logEvent("Website Click", `${name} → ${href}`);
    });
  });

  // Phone link clicks
  document.querySelectorAll("a.phone-link").forEach(link => {
    link.addEventListener("click", e => {
      const number = link.getAttribute("href");
      const row = link.closest("tr");
      const name = row?.getAttribute("data-key") || "Unknown";
      logEvent("Phone Click", `${name} → ${number}`);
    });
  });

  // Dropdown menu changes
  document.querySelectorAll("select.status-select").forEach(select => {
    select.addEventListener("change", e => {
      const selected = select.value;
      const row = select.closest("tr");
      const name = row?.getAttribute("data-key") || "Unknown";
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
          const row = input.closest("tr");
          const name = row?.getAttribute("data-key") || "Unknown";
          logEvent("Log Input", `${name} → "${text}"`, row);
          input.value = ""; // Clear input
        }
      }
    });
  });

  // Load log notes from localStorage on page load
  const saved = localStorage.getItem('my_log_notes');
  if (saved) {
    document.getElementById('global-log').innerHTML = saved;
  }

});