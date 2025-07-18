function renderAnalytics() {
  // Check if required elements exist
  if (!document.getElementById('statusPieChart') ||
      !document.getElementById('logLineChart') ||
      !document.getElementById('linkBarChart') ||
      !document.querySelector('tbody tr')) {
    // Try again in 200ms
    setTimeout(renderAnalytics, 200);
    return;
  }

  // --- Gather data ---
  const rows = document.querySelectorAll("tbody tr");

  // 1. Status Pie Chart Data
  const statusCounts = { 
    "open": 0, 
    "no answer": 0, 
    "not qualified": 0, 
    "follow up": 0, 
    "call back": 0, 
    "not interested": 0, 
    "unknown": 0 
  };
  rows.forEach(row => {
    const select = row.querySelector(".status-select");
    let status = select ? select.value : "unknown";
    if (!statusCounts.hasOwnProperty(status)) status = "unknown";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // 2. Log Line Chart Data (logs per 10-minute interval, using username and GMT time)
  const globalLog = document.getElementById("global-log");
  const logByInterval = {};
  let logCount = 0;
  if (globalLog) {
    const entries = Array.from(globalLog.querySelectorAll("div"));
    logCount = entries.length;
    entries.forEach(entry => {
      // Expect timestamp at start, e.g. "2025-07-08 14:32:01 | username | ..."
      const match = entry.textContent.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/);
      if (match) {
        const date = match[1];
        const hour = match[2];
        const minute = match[3];
        // Round down to nearest 10 min
        const minGroup = Math.floor(parseInt(minute, 10) / 10) * 10;
        const intervalLabel = `${date} ${hour}:${minGroup.toString().padStart(2, '0')}`;
        logByInterval[intervalLabel] = (logByInterval[intervalLabel] || 0) + 1;
      }
    });
  }

  // 3. Bar Chart of link clicks (from log)
  let phoneClicks = 0, emailIconClicks = 0, websiteClicks = 0, emailIconRightClicks = 0;
  if (globalLog) {
    const entries = Array.from(globalLog.querySelectorAll("div"));
    entries.forEach(entry => {
      const txt = entry.textContent;
      // Phone icon clicks
      if (/Phone Click/i.test(txt)) phoneClicks++;
      // Email icon clicks (look for "Email Click" in log)
      if (/Email Click/i.test(txt)) emailIconClicks++;
      // Website clicks
      if (/Website Click/i.test(txt)) websiteClicks++;
      // Email icon right-clicks
      if (/Email Icon Right-Click/i.test(txt)) emailIconRightClicks++;
    });
  }

  // --- Render numbers ---
  const analyticsNumbers = document.getElementById("analytics-numbers");
  if (analyticsNumbers) {
    analyticsNumbers.innerHTML = `
      <strong>Analytics Summary</strong><br>
      Companies: <span style="color:#2563eb">${rows.length}</span> &nbsp;|&nbsp;
      Log Entries: <span style="color:#f59e42">${logCount}</span> &nbsp;|&nbsp;
      Phone Clicks: <span style="color:#10b981">${phoneClicks}</span> &nbsp;|&nbsp;
      Email Clicks: <span style="color:#6366f1">${emailIconClicks}</span> &nbsp;|&nbsp;
      Website Clicks: <span style="color:#3b82f6">${websiteClicks}</span> &nbsp;|&nbsp;
      Email Icon Right-Clicks: <span style="color:#f43f5e">${emailIconRightClicks}</span>
    `;
  }

  // --- Destroy old charts if they exist ---
  if (window.statusPieChartObj) window.statusPieChartObj.destroy();
  if (window.logLineChartObj) window.logLineChartObj.destroy();
  if (window.linkBarChartObj) window.linkBarChartObj.destroy();

  // --- Chart 1: Status Pie Chart ---
  const statusLabels = Object.keys(statusCounts);
  const statusData = statusLabels.map(k => statusCounts[k]);
  const statusColors = [
    '#3b82f6', // open
    '#fbbf24', // no answer
    '#6366f1', // not qualified
    '#f59e42', // follow up
    '#10b981', // call back
    '#ef4444', // not interested
    '#888888'  // unknown
  ];

  window.statusPieChartObj = new Chart(document.getElementById('statusPieChart').getContext('2d'), {
    type: 'pie',
    data: {
      labels: statusLabels,
      datasets: [{
        data: statusData,
        backgroundColor: statusColors
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // --- Chart 2: Log Line Chart (10-min intervals) ---
  const intervalLabels = Object.keys(logByInterval).sort();
  const intervalCounts = intervalLabels.map(label => logByInterval[label]);
  window.logLineChartObj = new Chart(document.getElementById('logLineChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: intervalLabels,
      datasets: [{
        label: 'Log Entries per 10 Minutes',
        data: intervalCounts,
        borderColor: '#f59e42',
        backgroundColor: 'rgba(245,158,66,0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 18
          }
        },
        y: { beginAtZero: true, ticks: { precision:0 } }
      }
    }
  });

  // --- Chart 3: Bar Chart of link clicks (phone, email icon, website) ---
  window.linkBarChartObj = new Chart(document.getElementById('linkBarChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Phone', 'Email Icon', 'Website'],
      datasets: [{
        label: 'Link Clicks',
        data: [phoneClicks, emailIconClicks, websiteClicks],
        backgroundColor: ['#10b981', '#6366f1', '#3b82f6']
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { precision:0 } } }
    }
  });
}

// Initial render (with fallback for static/downloaded pages)
function tryRenderAnalytics(retries = 10) {
  if (
    document.getElementById('statusPieChart') &&
    document.getElementById('logLineChart') &&
    document.getElementById('linkBarChart') &&
    document.querySelector('tbody tr')
  ) {
    renderAnalytics();
  } else if (retries > 0) {
    setTimeout(() => tryRenderAnalytics(retries - 1), 200);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  tryRenderAnalytics();
  const updateBtn = document.getElementById("update-analytics");
  if (updateBtn) {
    updateBtn.addEventListener("click", renderAnalytics);
  }
});