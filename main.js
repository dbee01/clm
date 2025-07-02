function writeToGlobalLog(message) {
  const log = document.getElementById("global-log");
  const timestamp = new Date().toLocaleString();
  const user = "user";
  const entry = `${timestamp} — ${user} — ${message}`;
  const logLine = document.createElement("div");
  logLine.textContent = entry;
  log.appendChild(logLine);
}

function loadData() {
  const rows = document.querySelectorAll("#data-table tr[data-key]");
  rows.forEach(row => {
    const key = row.getAttribute("data-key");
    if (!key) return;

    const statusSelect = row.querySelector("select.status-select");
    const savedStatus = localStorage.getItem(key + "_status");
    if (statusSelect && savedStatus) {
      statusSelect.value = savedStatus;
    }

    const logHistory = row.querySelector(".log-history");
    if (logHistory) {
      const savedLog = localStorage.getItem(key + "_log");
      if (savedLog) {
        logHistory.innerText = savedLog;
      }
    }
  });
}

function setupStatusListeners() {
  const selects = document.querySelectorAll("select.status-select");
  selects.forEach(select => {
    select.addEventListener("change", e => {
      const row = e.target.closest("tr");
      const key = row.getAttribute("data-key");
      if (key) {
        localStorage.setItem(key + "_status", e.target.value);
        writeToGlobalLog(`status — ${e.target.value}`);
      }
    });
  });
}

function savePage() {
  const clone = document.documentElement.cloneNode(true);

  document.querySelectorAll("tr[data-key]").forEach(row => {
    const key = row.getAttribute("data-key");
    const clonedRow = clone.querySelector(`tr[data-key='${key}']`);
    if (!clonedRow) return;

    const status = row.querySelector("select.status-select");
    const clonedStatus = clonedRow.querySelector("select.status-select");
    if (status && clonedStatus) {
      clonedStatus.value = status.value;
    }

    const log = row.querySelector(".log-history");
    const clonedLog = clonedRow.querySelector(".log-history");
    if (log && clonedLog) {
      clonedLog.innerText = log.innerText;
    }
  });

  const originalLog = document.getElementById("global-log");
  const clonedLog = clone.querySelector("#global-log");
  if (originalLog && clonedLog) {
    clonedLog.innerHTML = originalLog.innerHTML;
  }

  const blob = new Blob(["<!DOCTYPE html>\n<html>" + clone.innerHTML + "</html>"], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = location.pathname.split("/").pop() || "data.html";
  link.click();
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupStatusListeners();
  setupLogInputs();
});
