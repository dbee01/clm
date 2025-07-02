let logData = [];
let user = "Dara";

// Store Chart instances globally to destroy before redraw
let activityChartInstance = null;
let statusChartInstance = null;
let contactChartInstance = null;

function appendToLog(text) {
  const now = new Date().toLocaleString();
  const entry = ${user} | ${now} | ${text};
  logData.push(entry);
  document.getElementById("page-log").textContent = logData.join("\n");
  updateAnalytics();
}

function updateAnalytics() {
  const statusCounts = { open: 0, connected: 0, 'call back': 0, 'not interested': 0 };
  let emailed = 0, calls = 0;
  logData.forEach(entry => {
    if (entry.includes('| status |')) {
      const status = entry.split('| status |')[1].trim().toLowerCase();
      if (statusCounts[status] !== undefined) statusCounts[status]++;
    }
    if (entry.includes('| email |')) emailed++;
    if (entry.includes('| phone |')) calls++;
  });

  document.getElementById("total-contacts").innerText = document.querySelectorAll("#data-table tr[data-key]").length;
  document.getElementById("follow-up").innerText = statusCounts['connected'];
  document.getElementById("open-count").innerText = statusCounts['open'];
  document.getElementById("emailed-count").innerText = emailed;
  document.getElementById("calls-count").innerText = calls;

  drawCharts(statusCounts);
}

function drawCharts(statusCounts) {
  // Prepare time labels and counts for charts
  const labels = [];
  const countPerTime = {};
  const emailCounts = [];
  const callCounts = [];

  logData.forEach(l => {
    const parts = l.split('|').map(s => s.trim());
    const time = parts[1];
    const type = parts[2];

    if (!countPerTime[time]) countPerTime[time] = 0;
    countPerTime[time]++;

    labels.push(time);
    emailCounts.push(type === 'email' ? 1 : 0);
    callCounts.push(type === 'phone' ? 1 : 0);
  });

  // Destroy old charts to prevent errors
  if (activityChartInstance) activityChartInstance.destroy();
  if (statusChartInstance) statusChartInstance.destroy();
  if (contactChartInstance) contactChartInstance.destroy();

  // Activity chart - total actions over time
  const ctx1 = document.getElementById('activityChart').getContext('2d');
  activityChartInstance = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: Object.keys(countPerTime),
      datasets: [{
        label: 'Activity',
        data: Object.values(countPerTime),
        borderColor: 'blue',
        fill: false,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Time' } },
        y: { title: { display: true, text: 'Actions' }, beginAtZero: true }
      }
    }
  });

  // Status bar chart
  const ctx2 = document.getElementById('statusChart').getContext('2d');
  statusChartInstance = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        label: 'Status Count',
        data: Object.values(statusCounts),
        backgroundColor: 'orange'
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Status' } },
        y: { title: { display: true, text: 'Count' }, beginAtZero: true }
      }
    }
  });

  // Contacts line comparison chart (calls vs emails)
  const ctx3 = document.getElementById('contactChart').getContext('2d');
  contactChartInstance = new Chart(ctx3, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Calls',
          data: callCounts,
          borderColor: 'green',
          fill: false,
          tension: 0.2
        },
        {
          label: 'Emails',
          data: emailCounts,
          borderColor: 'red',
          fill: false,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Time' } },
        y: { title: { display: true, text: 'Count' }, beginAtZero: true }
      }
    }
  });
}

// Hook up event listeners after DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll("a[href^='tel']").forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent real call during testing
      appendToLog(phone | ${link.getAttribute('href').replace('tel:', '')});
    });
  });
  document.querySelectorAll("a[href^='mailto']").forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      appendToLog(email | ${link.getAttribute('href').replace('mailto:', '')});
    });
  });
  document.querySelectorAll("a[href^='http']").forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      appendToLog(website | ${link.getAttribute('href')});
    });
  });
  document.querySelectorAll("select").forEach(select => {
    select.addEventListener('change', () => appendToLog(status | ${select.value}));
  });
  document.querySelectorAll("input[type='text']").forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        appendToLog(log | ${input.value});
        input.value = '';
      }
    });
  });
});

function savePage() {
  const html = document.documentElement.outerHTML;
  const blob = new Blob([html], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'personal-reachout.html';
  a.click();
  URL.revokeObjectURL(url);
}

function populateTable(data) {
  const table = document.getElementById('data-table');
  data.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.dataset.key = index;

    tr.innerHTML = 
      <td>${row.name}</td>
      <td>${row.description}</td>
      <td>${row.rating}</td>
      <td><a href="${row.website}" target="_blank">${row.website}</a></td>
      <td><a href="tel:${row.phone}">${row.phone}</a></td>
      <td>${row.review_keywords}</td>
      <td>${row.competitors}</td>
      <td>
        <select>
          <option value="open" ${row.status === 'open' ? 'selected' : ''}>Open</option>
          <option value="connected" ${row.status === 'connected' ? 'selected' : ''}>Connected</option>
          <option value="call back" ${row.status === 'call back' ? 'selected' : ''}>Call Back</option>
          <option value="not interested" ${row.status === 'not interested' ? 'selected' : ''}>Not Interested</option>
        </select>
      </td>
      <td class="log-column"><input type="text" placeholder="Add log entry" /></td>
    ;
    table.appendChild(tr);
  });
}

populateTable(jsonData);
updateAnalytics();
