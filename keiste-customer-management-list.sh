
    inputEl.value = "";

  }

}


// Setup log input enter key to add log instantly

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

function savePage() {

  const htmlContent = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;

  const blob = new Blob([htmlContent], { type: 'text/html' });

  const link = document.createElement('a');

  const filename = location.pathname.split("/").pop() || "data.html";

  link.href = URL.createObjectURL(blob);

  link.download = filename;

  link.click();


  const infoDiv = document.getElementById("save-location");

  infoDiv.textContent = `Backup page saved in your browser's downloads folder)`;

}


  document.addEventListener("DOMContentLoaded", () => {

    loadData();

    setupStatusListeners();

    setupLogInputs();

  });

  

</script>

</body>

</html>

EOF

