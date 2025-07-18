#!/bin/bash
# --- Usage: ./main.sh input.ndjson html/main.html output/keiste.html LOGO_URL ---

if [ "$#" -ne 4 ]; then
  echo "Usage: $0 input.ndjson html/main.html output/keiste.html LOGO_URL"
  exit 1
fi

INPUT="$1"
TEMPLATE_HTML="$2"
OUTPUT_HTML="$3"
LOGO_URL="$4"


# If you have a local Chart.js, otherwise download and save it
# as they appear in the ndjson file
FIELDS=("name" "description" "website" "phone" "email" "categories" "status" "log")

# --- Styling ---
BASE_STYLE="text-align: left; padding: 12px; font-weight: 400; font-size: 16px;"
ICON_STYLE="display: inline-block; width: 1em; height: 1em; vertical-align: middle;font-size: 24px;"
SELECT_STYLE="$BASE_STYLE"

# --- SVG Icons ---
svg_web='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" fill="currentColor"><path d="M248 8C111 8 0 119 0 256s111 248 248 248S496 393 496 256 385 8 248 8zM45.2 176H150c-3.5 31.4-5.5 64.3-6.1 96H39.2c-2.3-10.3-3.6-21-3.6-32s1.3-21.7 3.6-32zM62.3 352H144c3.6 35.2 10.2 68.5 19.2 96H111.7C90.1 418.3 73.1 386.9 62.3 352zm81.7-192H61.7C73.1 125.1 90.1 93.7 111.7 64h51.5c-9 27.5-15.6 60.8-19.2 96zm104 288c-20.2-20.7-36.2-60.6-43.2-96h86.3c-7 35.4-23 75.3-43.2 96zm-43.2-128c-1.9-31.5-1.8-64.3 0-96h86.3c1.9 31.7 1.8 64.3 0 96h-86.3zm129.5 128c9-27.5 15.6-60.8 19.2-96h81.7c-10.8 34.9-27.8 66.3-49.4 96h-51.5zM345.3 256c-.6-31.7-2.6-64.6-6.1-96h104.9c2.3 10.3 3.6 21 3.6 32s-1.3 21.7-3.6 32H345.3zM319.5 64h51.5c21.6 29.7 38.6 61.1 49.4 96h-81.7c-3.6-35.2-10.2-68.5-19.2-96zM248 48c20.2 20.7 36.2 60.6 43.2 96h-86.3c7-35.4 23-75.3 43.2-96zM8 256c0-136.9 111.1-248 248-248s248 111.1 248 248-111.1 248-248 248S8 392.9 8 256z"/></svg>'
svg_phone='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" ><path d="M493.4 24.6l-104-24C373.7-4.8 358.1 4.5 353.5 19.5l-48 160c-4.2 14.2 1.8 29.3 14.7 37l60.7 35.1c-36.1 68.6-93.3 125.7-162 162l-35.1-60.7c-7.7-12.9-22.8-18.9-37-14.7l-160 48C4.5 358.1-4.8 373.7 0.6 387.4l24 104c3.3 14.2 16 24.6 30.6 24.6C417.3 512 512 417.3 512 256c0-14.6-10.4-27.3-24.6-30.6z"/></svg>'
svg_email='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M502.3 190.8L327.4 338.6c-17.8 14.7-43.1 14.7-60.9 0L9.7 190.8C3.7 185.8 0 178.6 0 171V96c0-35.3 28.7-64 64-64h384c35.3 0 64 28.7 64 64v75c0 7.6-3.7 14.8-9.7 19.8zM0 216v200c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V216L352.7 363.3c-35.7 29.4-87.7 29.4-123.4 0L0 216z"/></svg>'

# --- Star rating CSS (will be appended after table rows) ---
STAR_STYLE='<style>
.star-rating { display:inline-block; font-size:1.3em; letter-spacing:2px; vertical-align:middle; }
.star { color: #cbd5e1; transition: color 0.2s; font-size:1.4em; }
.star.filled { color: #fbbf24; }
.star.half { color: #fbbf24; position: relative;}
.star.half:after {
  content: "\\2605";
  color: #cbd5e1;
  position: absolute;
  left: 0.5em;
  width: 0.7em;
  overflow: hidden;
  display: inline-block;
}
</style>'

# --- Temporary output ---
TABLE_TMP="$(mktemp)"

declare -A SEEN_PHONES

jq -c '.' "$INPUT" | while read -r row; do
  phone=$(echo "$row" | jq -r '.phone // ""' | sed -E 's/[^0-9]//g' | sed -E 's/^0*//')
  if [ -n "$phone" ]; then
    if [[ -n "${SEEN_PHONES[$phone]}" ]]; then
      continue  # skip duplicate phone
    fi
    SEEN_PHONES[$phone]=1
  fi

  key=$(echo "$row" | jq -r '.name' | sed 's/[^a-zA-Z0-9_-]/_/g')
  echo "  <tr data-key=\"$key\">" >> "$TABLE_TMP"

  for field in "${FIELDS[@]}"; do
    html=""
    td_class=""
    value=$(echo "$row" | jq -r --arg f "$field" '.[$f] // ""')

    case "$field" in
        "name")
            html="$value"
            ;;
        "website")
            if [ -n "$value" ] && [ "$value" != "null" ]; then
              domain=$(echo "$value" | awk -F/ '{print $3}')
              html="<a href=\"$value\" target=\"_blank\" class=\"website-link\" style=\"$BASE_STYLE\"><span style=\"$ICON_STYLE\">$svg_web</span></a>"
            else
              html=""
            fi
            ;;
        "phone")
            if [ -n "$value" ] && [ "$value" != "null" ]; then
              digits=$(echo "$value" | sed -E 's/[^0-9]//g' | sed -E 's/^0*//')
              html="<a href=\"tel:00353$digits\" class=\"phone-link\" style=\"$BASE_STYLE\" data-number=\"$value\"><span style=\"$ICON_STYLE\">$svg_phone</span></a>"
            else
              html=""
            fi
            ;;
        "email")
            if [ -n "$value" ] && [ "$value" != "null" ]; then             
              html="<div style=\"display:flex; align-items:center;\">
                  <input type=\"text\" class=\"email-input\" placeholder=\"Enter email\" style=\"flex:1; padding:4px 8px; border-radius:4px; border:1px solid #ccc;\" value=\"$value\" />
                  <a class=\"email-link\" href=\"#\" target=\"_blank\" style=\"margin-left:6px; color:#3b82f6; font-size:1.2em; display:none;\" tabindex=\"-1\" title=\"Send Email\">
                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" style=\"vertical-align:middle;\" fill=\"currentColor\" viewBox=\"0 0 16 16\">
                      <path d=\"M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.383V5.383zm-.034 7.434-5.482-3.29-5.482 3.29A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.183zM1 11.383l4.708-3.175L1 5.383v6z\"/>
                    </svg>
                  </a>
                </div>
                <div class=\"email-error\" style=\"color:#dc3545; font-size:0.9em; display:none; margin-top:2px;\"></div>"
            else
              html="<div style=\"display:flex; align-items:center;\">
                  <input type=\"text\" class=\"email-input\" placeholder=\"Enter email\" style=\"flex:1; padding:4px 8px; border-radius:4px; border:1px solid #ccc;\" value=\"\" />
                  <a class=\"email-link\" href=\"#\" target=\"_blank\" style=\"margin-left:6px; color:#3b82f6; font-size:1.2em; display:none;\" tabindex=\"-1\" title=\"Send Email\">
                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" style=\"vertical-align:middle;\" fill=\"currentColor\" viewBox=\"0 0 16 16\">
                      <path d=\"M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.383V5.383zm-.034 7.434-5.482-3.29-5.482 3.29A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.183zM1 11.383l4.708-3.175L1 5.383v6z\"/>
                    </svg>
                  </a>
                </div>
                <div class=\"email-error\" style=\"color:#dc3545; font-size:0.9em; display:none; margin-top:2px;\"></div>"
            fi
            ;;
        "categories")
          if [ -n "$value" ] && [ "$value" != "null" ]; then
            html=$(echo "$row" | jq -r '.categories | join(", ")')
          else
            html=""
          fi
          ;;
        "status")
            html="<select class=\"status-select\" data-default=\"open\" style=\"color:white;font-weight:700;padding:12px;border-radius:20px;\">
              <option value=\"open\">Open</option>
              <option value=\"no answer\">No Answer</option>
              <option value=\"not qualified\">Not Qualified</option>
              <option value=\"follow up\">Follow Up</option>
              <option value=\"call back\">Call Back</option>
              <option value=\"not interested\">Not Interested</option>
            </select>"
            ;;
        "log")
            td_class="log-column"
            html="<input type=\"text\" placeholder=\"Add log...\" class=\"log-input\" style=\"$BASE_STYLE\" autocomplete=\"off\" />
                  <div class=\"row-log-notes\" style=\"font-size:0.95em; color:#444; margin-top:4px;\"></div>"
            ;;
        "description")
            if [ -z "$value" ] || [ "$value" = "null" ]; then
              html="no description"
            else
              html=$(echo "$value" | awk 'BEGIN{RS="\\."} NR==1{print $0}')
              if [ -z "$html" ]; then html="no description"; fi
            fi
            ;;      
    esac

    echo "    <td class=\"$td_class\">$html</td>" >> "$TABLE_TMP"
  done
  echo "  </tr>" >> "$TABLE_TMP"
done

# --- Inject table into template ---
mkdir -p "$(dirname "$OUTPUT_HTML")"

# Substitute {table} placeholder in the template with the generated table rows
# --- Inject table into template ---
mkdir -p "$(dirname "$OUTPUT_HTML")"

awk -v tablefile="$TABLE_TMP" '
  BEGIN {
    # Read the table file into an array
    n = 0
    while ((getline line < tablefile) > 0) {
      table[++n] = line
    }
    close(tablefile)
  }
  {
    if ($0 ~ /\{table\}/) {
      # Print each line of the table in place of {table}
      for (i = 1; i <= n; i++) print table[i]
    } else {
      print
    }
  }
' "$TEMPLATE_HTML" > "$OUTPUT_HTML"

sed -i "s|{logo_url}|$LOGO_URL|g" "$OUTPUT_HTML"

rm "$TABLE_TMP"
