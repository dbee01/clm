# customer list management platform
a simple customer-list-management js dom app produced from a bash shell script and a botasaurus scrape of Google Maps business info for your chosen keywords

it's a bash script that reads the Google Map ndjson files scraped by https://github.com/omkarcloud/google-maps-scraper written by https://www.omkar.cloud and @https://www.omkar.cloud/botasaurus/ . it then extracts the data and turns it into a Customer List Management html + JS file

live demo:

https://keiste.com/wp-content/uploads/2025/06/recruiter-cork.html

to test:

1. Run the googlemapsextractor for your chosen target market eg. 'recruiters in Cork'
2. Run this repo shell script `keiste-customer-management-list.sh <input.ndjson> <output.html>`
3. Open the html file in your desktop browser
4. You may have to configure an application to run browser click-to-call links eg. Skype, Google Voice etc.

contact me at info@keiste.com if you are looking for support
