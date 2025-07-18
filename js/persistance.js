document.addEventListener("DOMContentLoaded", function () {
  const globalLog = document.getElementById('global-log');

  // Restore log from localStorage
  const savedLog = localStorage.getItem('globalLog');
  if (savedLog) {
    globalLog.innerHTML = savedLog;
  }

  // Add a log entry and persist
  function addLogEntry(eventType, details) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const entry = document.createElement('div');
    entry.textContent = `${dateStr} ${eventType} ${details}`;
    globalLog.appendChild(entry);
    localStorage.setItem('globalLog', globalLog.innerHTML);
  }

  // Observe changes to the log and persist (in case of manual edits)
  const observer = new MutationObserver(() => {
    localStorage.setItem('globalLog', globalLog.innerHTML);
  });
  observer.observe(globalLog, { childList: true, subtree: true });

  // Example: Call addLogEntry when you want to log an event
  // addLogEntry('CLICK', 'Website link clicked');

  // Example event listeners for demo (customize as needed)
  document.querySelectorAll('.website-link').forEach(link => {
    link.addEventListener('click', e => {
      addLogEntry('CLICK', `Website: ${link.href}`);
    });
  });
  document.querySelectorAll('.phone-link').forEach(link => {
    link.addEventListener('click', e => {
      addLogEntry('CLICK', `Phone: ${link.getAttribute('data-number') || link.href}`);
    });
  });
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', e => {
      addLogEntry('STATUS', `Changed to: ${select.value}`);
    });
  });
  document.querySelectorAll('.log-input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && input.value.trim()) {
        addLogEntry('LOG', input.value.trim());
        input.value = '';
      }
    });
  });
});