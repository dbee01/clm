# customer list management platform

Tired of cold emailing leads? need a better way of making real personal B2B connections? 

Our Customer List Management app gives you all the info your need to strike up a conversation with a business and impress the gatekeeper eg. receptionist / secretary or the decision maker with your knowledge of their company.

Our simple app features:

* note taking on page
* click-to-call functionality
* relevant talking points
* key business info eg. name, website, description
* a list of key business competitors
* a status setting for you to update leads as you click
* auto-save functionality

It's a bash script that reads the Google Map .ndjson files scraped by https://github.com/omkarcloud/google-maps-scraper written by https://www.omkar.cloud and @https://www.omkar.cloud/botasaurus/ . it then extracts the data and turns it into a Customer List Management html + JS file

Screenshot:

https://ibb.co/Vc40d8N2

Live demo:

https://keiste.com/wp-content/uploads/2025/06/keiste.html

I'll create your custom list file with data from your chosen target market eg. 'HVAC in Denver' for a small fee. Contact me at info@keiste.com

Run to test:

1. Run the https://github.com/omkarcloud/google-maps-scraper for your chosen target market eg. 'recruiters in Cork'
2. Run this repo shell script `keiste-customer-list-management.sh <input.ndjson> <output.html>`
3. Open the html file in your desktop browser
4. You may have to configure an application to run browser click-to-call links eg. Skype, Google Voice etc.

Contact me at info@keiste.com if you are looking for support
