#!/bin/bash
# Usage: ./main.sh input.ndjson html/main.html output/keiste.html

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 input.ndjson html/main.html output/keiste.html"
  exit 1
fi

INPUT="$1"
TEMPLATE_HTML="$2"
OUTPUT_HTML="$3"

FIELDS=("name" "description" "rating" "website" "phone" "email" "review_keywords" "competitors" "status" "log")

# --- Styling ---
BASE_STYLE="color: black;text-align: left; padding: 12px; font-weight: 400; font-size: 16px;"
ICON_STYLE="display: inline-block; width: 1em; height: 1em; vertical-align: middle;font-size: 24px;"
SELECT_STYLE="$BASE_STYLE"

# --- SVG Icons ---
svg_web='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" fill="currentColor" class="svg-web" ><path d="M248 8C111 8 0 119 0 256s111 248 248 248S496 393 496 256 385 8 248 8zM45.2 176H150c-3.5 31.4-5.5 64.3-6.1 96H39.2c-2.3-10.3-3.6-21-3.6-32s1.3-21.7 3.6-32zM62.3 352H144c3.6 35.2 10.2 68.5 19.2 96H111.7C90.1 418.3 73.1 386.9 62.3 352zm81.7-192H61.7C73.1 125.1 90.1 93.7 111.7 64h51.5c-9 27.5-15.6 60.8-19.2 96zm104 288c-20.2-20.7-36.2-60.6-43.2-96h86.3c-7 35.4-23 75.3-43.2 96zm-43.2-128c-1.9-31.5-1.8-64.3 0-96h86.3c1.9 31.7 1.8 64.3 0 96h-86.3zm129.5 128c9-27.5 15.6-60.8 19.2-96h81.7c-10.8 34.9-27.8 66.3-49.4 96h-51.5zM345.3 256c-.6-31.7-2.6-64.6-6.1-96h104.9c2.3 10.3 3.6 21 3.6 32s-1.3 21.7-3.6 32H345.3zM319.5 64h51.5c21.6 29.7 38.6 61.1 49.4 96h-81.7c-3.6-35.2-10.2-68.5-19.2-96zM248 48c20.2 20.7 36.2 60.6 43.2 96h-86.3c7-35.4 23-75.3 43.2-96zM8 256c0-136.9 111.1-248 248-248s248 111.1 248 248-111.1 248-248 248S8 392.9 8 256z"/></svg>'
svg_phone='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="svg-phone" ><path d="M493.4 24.6l-104-24C373.7-4.8 358.1 4.5 353.5 19.5l-48 160c-4.2 14.2 1.8 29.3 14.7 37l60.7 35.1c-36.1 68.6-93.3 125.7-162 162l-35.1-60.7c-7.7-12.9-22.8-18.9-37-14.7l-160 48C4.5 358.1-4.8 373.7 0.6 387.4l24 104c3.3 14.2 16 24.6 30.6 24.6C417.3 512 512 417.3 512 256c0-14.6-10.4-27.3-24.6-30.6z"/></svg>'
svg_email='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"  class="svg-email" ><path d="M502.3 190.8L327.4 338.6c-17.8 14.7-43.1 14.7-60.9 0L9.7 190.8C3.7 185.8 0 178.6 0 171V96c0-35.3 28.7-64 64-64h384c35.3 0 64 28.7 64 64v75c0 7.6-3.7 14.8-9.7 19.8zM0 216v200c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V216L352.7 363.3c-35.7 29.4-87.7 29.4-123.4 0L0 216z"/></svg>'

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

jq -c '.' "$INPUT" | while read -r row; do
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
          html="<a href=\"mailto:$value\" class=\"email-link\" style=\"$BASE_STYLE\"><span style=\"$ICON_STYLE\">$svg_email</span></a>"
        else
          html=""
        fi
        ;;
      "review_keywords")
        html=$(echo "$row" | jq -r '.review_keywords // [] | map(.keyword) | join(", ")')
        ;;
      "competitors")
        html=$(echo "$row" | jq -r '.competitors // [] | map(.name) | join(", ")')
        ;;
      "status")
        html="<select class=\"status-select\" data-default=\"open\" style=\"color:white;font-weight:700;padding:12px;border-radius:20px;\">
          <option value=\"open\">Open</option>
          <option value=\"follow up\">Follow Up</option>
          <option value=\"call back\">Call Back</option>
          <option value=\"not interested\">Not Interested</option>
        </select>"
        ;;
      "log")
        td_class="log-column"
        html="<input type=\"text\" placeholder=\"Add log...\" class=\"log-input\" style=\"$BASE_STYLE\" autocomplete=\"off\" />
              <div class=\"log-history\"></div>"
        ;;
      "description")
        if [ -z "$value" ] || [ "$value" = "null" ]; then
          html="no description"
        else
          html=$(echo "$value" | sed -E 's/([^.]*\.)?.*/\1/')
          if [ -z "$html" ]; then html="no description"; fi
        fi
        ;;
      "rating")
        td_class="rating-cell"
        rating=${value:-0}
        rating_int=${rating%%.*}
        rating_frac="0"
        if [[ "$rating" == *.* ]]; then
          rating_frac="0.${rating##*.}"
        fi

        stars_html=""
        for i in $(seq 1 $rating_int); do
          stars_html="$stars_html<span class=\"star filled\">\&#9733;</span>"
        done

        next=$((rating_int + 1))
        if (( $(echo "$rating_frac >= 0.5" | bc -l) )); then
          stars_html="$stars_html<span class=\"star half\">\&#9733;</span>"
          next=$((rating_int + 2))
        fi

        for i in $(seq $next 5); do
          stars_html="$stars_html<span class=\"star\">\&#9734;</span>"
        done

        html="<div class=\"star-rating\">$stars_html</div>"
        ;;
    esac

    echo "    <td class=\"$td_class\">$html</td>" >> "$TABLE_TMP"
  done
  echo "  </tr>" >> "$TABLE_TMP"
done

# --- Inject table + star CSS into template ---
mkdir -p "$(dirname "$OUTPUT_HTML")"

awk '
  BEGIN {
    while ((getline line < table_file) > 0) {
      html_table = html_table line "\n"
    }
    close(table_file)
  }
  {
    gsub(/\{table\}/, html_table)
    print
  }
' table_file="$TABLE_TMP" "$TEMPLATE_HTML" > "$OUTPUT_HTML"

rm "$TABLE_TMP"