document.addEventListener("DOMContentLoaded", function () {

  // Status color mapping
  const statusColors = {
    "open":    { background: "#3b82f6", color: "white" },
    "follow up": { background: "#fd7e14", color: "white" },
    "call back": { background: "#28a745", color: "white" },
    "not interested": { background: "#dc3545", color: "white" }
  };

  function updateStatusSelectColors() {
    document.querySelectorAll('.status-select').forEach(select => {
      const val = select.value;
      const style = statusColors[val] || { background: "white", color: "#222" };
      select.style.background = style.background;
      select.style.color = style.color;
    });
  }

  // Initial coloring
  updateStatusSelectColors();

  // Update color on change
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', updateStatusSelectColors);
  });

  const rowsPerPage = 10;
  const tableBody = document.querySelector("tbody");
  if (!tableBody) return;

  const rows = Array.from(tableBody.querySelectorAll("tr"));
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const recordCountDiv = document.getElementById("record-count");

  function showPage(page) {
    rows.forEach((row, idx) => {
      row.style.display = (idx >= (page - 1) * rowsPerPage && idx < page * rowsPerPage) ? "" : "none";
    });

    // Update button styles
    paginationDiv.querySelectorAll("button.page-btn").forEach(btn => {
      const btnPage = parseInt(btn.dataset.page, 10);
      if (btnPage === page) {
        btn.style.background = "#3b82f6";
        btn.style.color = "white";
        btn.style.border = "1px solid #3b82f6";
      } else {
        btn.style.background = "white";
        btn.style.color = "#3b82f6";
        btn.style.border = "1px solid #ccc";
      }
    });

    // Enable/disable prev/next
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === totalPages;
    prevBtn.style.opacity = page === 1 ? "0.5" : "1";
    nextBtn.style.opacity = page === totalPages ? "0.5" : "1";

    // Update record count
    const start = (page - 1) * rowsPerPage + 1;
    const end = Math.min(page * rowsPerPage, totalRows);
    recordCountDiv.textContent = `Showing ${start}–${end} of ${totalRows} companies`;

    // Update dropdown colors on each page
    updateStatusSelectColors();
  }

  // Remove any existing pagination controls
  document.querySelectorAll(".js-pagination").forEach(el => el.remove());

  // Create pagination controls
  const paginationDiv = document.createElement("div");
  paginationDiv.className = "js-pagination";
  paginationDiv.style.margin = "20px 0 0 0";
  paginationDiv.style.display = "flex";
  paginationDiv.style.alignItems = "center";

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.style.marginRight = "5px";
  prevBtn.style.padding = "6px 12px";
  prevBtn.style.border = "1px solid #ccc";
  prevBtn.style.background = "white";
  prevBtn.style.borderRadius = "4px";
  prevBtn.style.cursor = "pointer";
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
    }
  });
  paginationDiv.appendChild(prevBtn);

  // Page number buttons
  let currentPage = 1;
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "page-btn";
    btn.dataset.page = i;
    btn.style.marginRight = "5px";
    btn.style.padding = "6px 12px";
    btn.style.border = i === 1 ? "1px solid #3b82f6" : "1px solid #ccc";
    btn.style.background = i === 1 ? "#3b82f6" : "white";
    btn.style.color = i === 1 ? "white" : "#3b82f6";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", () => {
      currentPage = i;
      showPage(currentPage);
    });
    paginationDiv.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.style.marginRight = "5px";
  nextBtn.style.padding = "6px 12px";
  nextBtn.style.border = "1px solid #ccc";
  nextBtn.style.background = "white";
  nextBtn.style.borderRadius = "4px";
  nextBtn.style.cursor = "pointer";
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      showPage(currentPage);
    }
  });
  paginationDiv.appendChild(nextBtn);

  // Insert pagination controls after the table
  const table = document.querySelector("table");
  if (table && totalPages > 1) {
    table.parentNode.insertBefore(paginationDiv, table.nextSibling);
  }

  // Email input validation and mailto link
  function validateEmail(email) {
    // Simple RFC 5322 compliant regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  document.querySelectorAll('.email-input').forEach(input => {
    const row = input.closest('tr');
    const link = row.querySelector('.email-link');
    const errorDiv = row.querySelector('.email-error');

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const email = input.value.trim();
        if (validateEmail(email)) {
          link.href = `mailto:${email}`;
          link.style.display = '';
          errorDiv.style.display = 'none';
        } else {
          link.style.display = 'none';
          errorDiv.textContent = 'Invalid email address';
          errorDiv.style.display = '';
        }
      }
    });

    // Optional: Hide error on input
    input.addEventListener('input', function() {
      errorDiv.style.display = 'none';
    });
  });

  document.getElementById('save-html-btn').addEventListener('click', function () {
    // Sync dropdowns to reflect current selection in HTML
    document.querySelectorAll('select').forEach(select => {
      const currentValue = select.value;
      Array.from(select.options).forEach(option => {
        if (option.value === currentValue) {
          option.setAttribute('selected', 'selected');
        } else {
          option.removeAttribute('selected');
        }
      });
    });

    // Get the current HTML content (no forced filename, let user choose)
    const htmlContent = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

    // Create a Blob and a temporary link for download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    // No fixed filename: let the browser/user decide
    a.download = ''; // This will prompt the user for a filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  });

  showPage(currentPage);
});