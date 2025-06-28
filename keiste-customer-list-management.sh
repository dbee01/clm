#!/bin/bash


if [ "$#" -ne 2 ]; then

  echo "Usage: $0 input.ndjson output.html"

  exit 1

fi


INPUT="$1"

OUTPUT="$2"


FIELDS=("name" "description" "rating" "website" "phone" "review_keywords" "competitors" "status" "log")


{

echo "<!DOCTYPE html>

<html>

<head>

  <meta charset=\"UTF-8\">

  <title>JSON Data Table</title>

  <style>

	@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');


	table { border-collapse: collapse; width: 100%;color: #343231; }

    	th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }

    	th { background-color: #f4f4f4; }

    	a { text-decoration: none; color: blue; }

    	input[type='text'] { width: 100%; box-sizing: border-box; }


	body {

	  font-family: 'Montserrat', sans-serif;

   margin: 20px; font-size: 16px;

	  background-color: #FAF9F6;

	  color: #343231;

	}


	.topbar {

	  display: flex;

	  justify-content: flex-end; /* Button right aligned */

	  align-items: center;

	  margin-bottom: 12px;

	  background: #ffffff;

	  padding: 10px 20px;

	  border-radius: 8px;

	  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

	  gap: 15px; /* space between message and button */

	}


	.save-button {

	  padding: 10px 20px;

	  background-color: #0078D7;

	  color: white;

	  border: none;

	  cursor: pointer;

	  border-radius: 6px;

	  font-size: 16px;

	  font-weight: 600;

	  transition: background-color 0.25s ease;

	  box-shadow: 0 4px 6px rgba(0,120,215,0.4);

	}

	.save-button:hover {

	  background-color: #005ea6;

	}


	#save-location {

	  font-size: 0.95em;

	  color: #444;

	  font-weight: 500;

	  text-align: right;

	  flex-grow: 1;  /* take all space left of button */

	  user-select: none;

	}


	td.log-column {

	width: 30%;

	}

	.log-history {

	font-size: 0.9em;

	margin-top: 6px;

	color: #555;

	white-space: pre-line;

	max-height: 200px;

	overflow-y: auto;

	border: 1px solid #ddd;

	padding: 6px;

	background: #f9f9f9;

	white-space: pre-wrap;

	min-height: 80px;

	}

  </style>

</head>

<body>

<div class=\"topbar\">

  <div id=\"save-location\"></div>

  <button class=\"save-button\" onclick=\"savePage()\">💾 Save Page</button>

</div>

  <h2>Personal Reachout Workspace by Dara at Keiste</h2>

  <table id=\"data-table\">

    <tr>"

for field in "${FIELDS[@]}"; do

  header=$(echo "$field" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')

  echo "      <th>$header</th>"

done

echo "    </tr>"

} > "$OUTPUT"


jq -c '.' "$INPUT" | while read -r row; do

  key=$(echo "$row" | jq -r '.name' | sed 's/[^a-zA-Z0-9_-]/_/g')


  echo "    <tr data-key=\"$key\">" >> "$OUTPUT"

  for field in "${FIELDS[@]}"; do

    td_class=""

    case "$field" in

      "website")

        value=$(echo "$row" | jq -r '.website // ""')

        domain=$(echo "$value" | awk -F/ '{print $3}')

        favicon="https://www.google.com/s2/favicons?sz=16&domain=$domain"

        html="<a href=\"$value\" target=\"_blank\"><img src=\"$favicon\" alt=\"favicon\" style=\"vertical-align:middle;margin-right:4px;\">Visit</a>"

       ;;

      "phone")

        value=$(echo "$row" | jq -r '.phone // ""')

        digits_only=$(echo "$value" | sed -E 's/[^0-9]//g')

        formatted_number=$(echo "$digits_only" | sed -E 's/^0*//')

        tel_link="tel:00353${formatted_number}"

        html="<a href=\"$tel_link\">Call</a>"

        ;;

      "review_keywords")

        html=$(echo "$row" | jq -r '.review_keywords // [] | map("\(.keyword) (\(.count))") | join(", ")')

        ;;

      "competitors")

        html=$(echo "$row" | jq -r '.competitors // [] | map(.name) | join(", ")')

        ;;

      "status")

        html="<select class=\"status-select\">

                <option value=\"open\">Open</option>

                <option value=\"connected\">Connected</option>

                <option value=\"call back\">Call Back</option>

                <option value=\"not interested\">Not Interested</option>

              </select>"

        ;;

      "log")

        td_class="log-column"

        html="<input type=\"text\" placeholder=\"Add log and press return...\" class=\"log-input\" autocomplete=\"off\" />

              <div class=\"log-history\"></div>"

        ;;

      *)

        value=$(echo "$row" | jq -r --arg f "$field" '.[$f] // ""')

        html="$value"

        ;;

    esac

            ;;

      *)

        value=$(echo "$row" | jq -r --arg f "$field" '.[$f] // ""')

        html="$value"

        ;;

    esac

    echo "      <td class=\"$td_class\">$html</td>" >> "$OUTPUT"

  done

  echo "    </tr>" >> "$OUTPUT"

done


cat <<'EOF' >> "$OUTPUT"

  </table>


<script>

    

// Load saved data from localStorage and populate fields

function loadData() {

  const rows = document.querySelectorAll("#data-table tr[data-key]");

  rows.forEach(row => {

    const key = row.getAttribute("data-key");

    if (!key) return;


    // Load status

    const statusSelect = row.querySelector("select.status-select");

    const savedStatus = localStorage.getItem(key + "_status");

    if (statusSelect && savedStatus) {

      statusSelect.value = savedStatus;

    }


    // Load log history

    const logHistory = row.querySelector(".log-history");

    if (logHistory) {

      const savedLog = localStorage.getItem(key + "_log");

      if (savedLog) {

        logHistory.innerText = savedLog;

      }

    }

  });

}
}


// Save status to localStorage on change

function setupStatusListeners() {

  const selects = document.querySelectorAll("select.status-select");

  selects.forEach(select => {

    select.addEventListener("change", e => {

      const row = e.target.closest("tr");

      const key = row.getAttribute("data-key");

      if (key) {

        localStorage.setItem(key + "_status", e.target.value);

      }

    });

  });

}


// Add log entry with timestamp and save to localStorage

function addLog(inputEl) {

  const row = inputEl.closest("tr");

  const key = row.getAttribute("data-key");

  const logDiv = inputEl.nextElementSibling;

  const newText = inputEl.value.trim();

  if (newText && key) {

    const timestamp = new Date().toLocaleString();

    // Append new entry with timestamp and newline

    let existingLogs = localStorage.getItem(key + "_log") || "";

    existingLogs += `${timestamp}: ${newText}\n`;

    localStorage.setItem(key + "_log", existingLogs);

    // Update the visible log immediately

    logDiv.innerText = existingLogs;

    inputEl.value = "";

  }

}
    // Update the visible log immediately

    logDiv.innerText = existingLogs;

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
