function addLog(inputEl) {
  const row = inputEl.closest("tr");
  const key = row.getAttribute("data-key");
  const logDiv = inputEl.nextElementSibling;
  const newText = inputEl.value.trim();
  if (newText && key) {
    const timestamp = new Date().toLocaleString();
    let existingLogs = localStorage.getItem(key + "_log") || "";
    existingLogs += `${timestamp}: ${newText}\n`;
    localStorage.setItem(key + "_log", existingLogs);
    logDiv.innerText = existingLogs;
    inputEl.value = "";
    writeToGlobalLog(`log — ${newText}`);
  }
}

function setupLogInputs() {
  const inputs = document.querySelectorAll("input.log-input");
  inputs.forEach(input => {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        addLog(e.target);
      }
    });
  });
}

document.addEventListener("click", function(e) {
  if (e.target.matches(".phone-link")) {
    writeToGlobalLog(`phone — ${e.target.dataset.number}`);
  }
  if (e.target.matches(".email-link")) {
    writeToGlobalLog(`email — ${e.target.textContent}`);
  }
  if (e.target.matches(".website-link")) {
    writeToGlobalLog(`website — ${e.target.href}`);
  }
});

