document.addEventListener("DOMContentLoaded", function () {
  // Export HubSpot Data as CSV
  const exportBtn = document.getElementById('export-hubspot-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      const columns = ["Company Name", "Description", "Website", "Phone", "Email", "Keywords", "Status", "Notes" ];
      const rows = [];
      document.querySelectorAll('.table-x-scroll tbody tr').forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(td => {
          return '"' + (td.innerText || td.textContent || '').replace(/"/g, '""') + '"';
        });
        if (cells.length === columns.length) rows.push(cells.join(','));
      });
      const csv = [columns.join(','), ...rows].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hubspot-export.csv';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    });
  }

  // Save Page as HTML (with current table and log)
  const saveHtmlBtn = document.getElementById('save-html-btn');
  if (saveHtmlBtn) {
    saveHtmlBtn.addEventListener('click', function () {
      const docClone = document.documentElement.cloneNode(true);

      // Replace table and log with current content
      const origTable = document.querySelector('.table-x-scroll');
      const cloneTable = docClone.querySelector('.table-x-scroll');
      if (origTable && cloneTable) cloneTable.innerHTML = origTable.innerHTML;

      const origLog = document.getElementById('global-log');
      const cloneLog = docClone.querySelector('#global-log');
      if (origLog && cloneLog) cloneLog.innerHTML = origLog.innerHTML;

      // Remove script tags to avoid re-running scripts on open
      docClone.querySelectorAll('script').forEach(s => s.remove());

      const html = '<!DOCTYPE html>\n' + docClone.outerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workspace-save.html';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    });
  }
});