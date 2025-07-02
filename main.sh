#!/bin/bash

if [ "$#" -ne 2 ]; then
   echo "Usage: $0 input.ndjson output.html"
   exit 1
fi

INPUT="$1"
OUTPUT="$2"

FIELDS=("name" "description" "rating" "website" "phone" "email" "review_keywords" "competitors" "status" "log")

{
echo "<tr>"
for field in "${FIELDS[@]}"; do
  header=$(echo "$field" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')
  echo "      <th>$header</th>"
done
echo "    </tr>"
} > "$OUTPUT"

jq -c '.' "$INPUT" | while read -r row; do
  key=$(echo "$row" | jq -r '.name' | sed 's/[^a-zA-Z0-9_-]/_/g')
  echo "    <tr data-key=\"$key\">" >> "$OUTPUT"
  for field in "${FIELDS[@]}"; do
    td_class=""
    case "$field" in
      "website")
        value=$(echo "$row" | jq -r '.website // ""')
        domain=$(echo "$value" | awk -F/ '{print $3}')
        favicon="https://www.google.com/s2/favicons?sz=16&domain=$domain"
        html="<a href=\"$value\" class=\"website-link\" target=\"_blank\"><img src=\"$favicon\" alt=\"favicon\" style=\"vertical-align:middle;margin-right:4px;\">Visit</a>"
        ;;
      "phone")
        value=$(echo "$row" | jq -r '.phone // ""')
        digits_only=$(echo "$value" | sed -E 's/[^0-9]//g')
        formatted_number=$(echo "$digits_only" | sed -E 's/^0*//')
        tel_link="tel:00353${formatted_number}"
        html="<a href=\"$tel_link\" class=\"phone-link\" data-number=\"$value\">Call</a>"
        ;;
      "email")
        value=$(echo "$row" | jq -r '.email // ""')
        html="<a href=\"mailto:$value\" class=\"email-link\">$value</a>"
        ;;
      "review_keywords")
	html=$(echo "$row" | jq -r '.review_keywords // [] | map(.keyword + " (" + (.count | tostring) + ")") | join(", ")')
        ;;
      "competitors")
        html=$(echo "$row" | jq -r '.competitors // [] | map(.name) | join(", ")')
        ;;
      "status")
        html="<select class=\"status-select\">
                <option value=\"open\">Open</option>
                <option value=\"follow up\">Follow Up</option>
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
    echo "      <td class=\"$td_class\">$html</td>" >> "$OUTPUT"
  done
  echo "    </tr>" >> "$OUTPUT"
done

cat <<'EOF' >> "$OUTPUT"
EOF
