const puppeteer = require('puppeteer');
const contentful = require('contentful-management');
const fetch = require('node-fetch');

// const client = contentful.createClient({
// 	accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
// });

(async () => {
	// const space = await client.getSpace('38idy44jf6uy');
	// const environment = await space.getEnvironment('master');
	// const entries = await environment.getEntries({ content_type: "driver" });
	
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setRequestInterception(true);

	const request = new Promise(resolve => {
    page.on('request', req => {
  		if (req.resourceType() === 'document' && req.url().substr(-4) === '.csv') {
        req.abort();
        const options = {
          encoding: null,
          method: req._method,
          headers: req._headers
        };
        /* resend the request */
        resolve(fetch(req._url, options));
  		} else {
  		  req.continue();
      }
  	});
  });
	  
	await page.goto('http://www.danlisa.com/scoring/season_race.php?race_id=104963&csv=y');
  
  const csv = await request;
  console.log(await csv.text());
	
	await browser.close();
	
})().catch((e) => console.error(e));