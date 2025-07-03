const colorMap = {
    "open": "blue",
    "follow up": "green",
    "call back": "gold",
    "not interested": "red"
  };
    document.querySelectorAll('.svg-phone').forEach(function(span) {
      span.addEventListener('click', function() {
        span.classList.toggle('clicked');
      });
    });
  function updateSelectBackground(select) {
    const color = colorMap[select.value] || "white";
    select.style.backgroundColor = color;
    select.style.color = (color === 'yellow' || color === 'gold') ? 'black' : 'white';
  }

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.status-select').forEach(select => {
      // Set default color
      updateSelectBackground(select);

      // Set color on change
      select.addEventListener('change', () => updateSelectBackground(select));
    });

    // 4. Optional: Ripple effect for icon buttons on click
    document.querySelectorAll('.icon-btn').forEach(btn => {
      btn.addEventListener('mousedown', function(e) {
        btn.classList.add('active');
      });
      btn.addEventListener('mouseup', function(e) {
        btn.classList.remove('active');
      });
      btn.addEventListener('mouseleave', function(e) {
        btn.classList.remove('active');
      });
      // Accessible focus
      btn.addEventListener('focus', function() {
        btn.style.boxShadow = '0 0 0 2px #3b82f644';
      });
      btn.addEventListener('blur', function() {
        btn.style.boxShadow = '';
      });
    });
  });

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
