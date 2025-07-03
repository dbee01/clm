#!/usr/bin/env bash
# ndjson‑to‑table.sh ─ convert an .ndjson file to an HTML table
# Usage: ./ndjson‑to‑table.sh file.ndjson > output.html

NDJSON_FILE="$1"
[ -z "$NDJSON_FILE" ] && { echo "Need an NDJSON file" >&2; exit 1; }

########################################
# 1️⃣  Declare the columns once, here
########################################
# Format: heading|jq_path|block_function(|optional_arg)
COLUMNS="
Name        | .name            | block_text
Phone       | .phone           | block_phone | \"[ \\-()]\"   # strip spaces, dashes, parens
Email       | .email           | block_email
Competitors | .competitors     | block_competitors
"

########################################
# 2️⃣  Generate the jq program on the fly
########################################
jq_filter='
  ####################################
  # Library of “block functions”
  ####################################
  def html_escape:
      gsub("&";"&amp;") | gsub("<";"&lt;") | gsub(">";"&gt;");

  # -- generic passthrough ------------
  def block_text(val):
      (val // "") | tostring | html_escape;

  # -- click‑to‑call phone ------------
  def block_phone(clean; val):
      (val // "") as $v
      | ($v|gsub(clean;"")) as $dial
      | if $v=="" then "" else "<a href=\"tel:" + $dial + "\">" + ($v|html_escape) + "</a>" end;

  # -- mailto anchor ------------------
  def block_email(val):
      (val // "") as $e
      | if $e=="" then "" else
          "<a href=\"mailto:" + $e + "\">" + ($e|html_escape) + "</a>"
        end;

  # -- competitors as CSV -------------
  def block_competitors(arr):
      (arr // []) | map(.name) | join(", ") | html_escape;
  
  ####################################
  # Build the <tr> for each input line
  ####################################
  (
' 

# Build header row and per‑column processing
header_cells=()
row_cells=()

while IFS='|' read -r heading path func arg; do
  heading="$(echo "$heading" | xargs)"  # trim
  [ -z "$heading" ] && continue        # skip empty lines / comments
  header_cells+=("<th>${heading}</th>")
  if [ -z "$arg" ]; then
    row_cells+=("(${path} | ${func})")
  else
    row_cells+=("(${func}(${arg}; ${path}))")
  fi
done <<< "$COLUMNS"

# join cells with </td><td>
header_row="<tr>${header_cells[*]}</tr>"
jq_filter+='      "<tr><td>" + ('
jq_filter+="          ( [ $(IFS=' , '; echo "${row_cells[*]}") ] | join(\"</td><td>\") )"
jq_filter+='      ) + "</td></tr>"'
jq_filter+='    )'

jq_filter+='
  )                # end block building <tr>
' 

# Wrap with table tags and stream the data
jq_filter+='
BEGIN { print "<table border=\"1\">"; print "'"$header_row"'"; print "<tbody>"; }
  (inputs | fromjson?) | . as $row | '"$jq_filter"'
END   { print "</tbody></table>"; }
'

########################################
# 3️⃣  Run jq with the generated filter
########################################
jq -Rn "$jq_filter" < "$NDJSON_FILE"
