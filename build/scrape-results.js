const puppeteer = require('puppeteer');
const contentful = require('contentful-management');
const fetch = require('node-fetch');
const parse = require('csv-parse');

const client = contentful.createClient({
	accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

(async () => {
	const space = await client.getSpace('38idy44jf6uy');
	const environment = await space.getEnvironment('master');
	const entries = await environment.getEntries({ content_type: "driver" });
	
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setRequestInterception(true);

	const request = new Promise(resolve => {
    page.on('request', req => {
  		if (req.resourceType() === 'document' && req.url().substr(-4) === '.csv') {
        const options = {
          encoding: null,
          method: req._method,
          headers: req._headers
        };
        /* resend the request */
        resolve(fetch(req._url, options));
      }
		  req.continue();
  	});
  });
	  
	await page.goto('http://www.danlisa.com/scoring/season_race.php?race_id=104963&csv=y');
  
  const response = await request;
  const csv = await response.text();
  
  const race = await new Promise((resolve, reject) => {
    parse(csv, {
      relax_column_count: true,
      from_line: 1,
      to_line: 11,
      on_record: record => record[1]
    }, (err, output) => {
      if (err) reject(err);
      else resolve({
        league: output[0],
        series: output[1],
        season: output[2],
        date: new Date(output[3]),
        track: output[4],
        laps: output[5],
        duration: output[6],
        cautions: output[7],
        cautionLaps: output[8],
        leadChanges: output[9],
        leaders: output[10]
      });
    })
  });
  
  const results = await new Promise((resolve, reject) => {
    parse(csv, {
      relax_column_count: true,
      columns: true,
      from_line: 12,
      on_record: (record, context) => ({
        driver: (name => {
          const driver = entries.items.find(driver => driver.fields.name['en-US'] === name);
          return driver ? driver.sys.id : name;
        })(record['Driver']),
        car: record['Car'],
        start: record['Start'],
        finish: record['Finish'],
        interval: record['Interval'],
        points: record['Race Points'],
        bonus: record['Bonus Points'],
        penalty: record['Penalty Points'],
        completed: record['Laps Completed'],
        led: record['Laps Led'],
        fastest: record['Fastest Lap'],
        average: record['Average Lap'],
        incidents: record['Incidents'],
        status: record['Status']
      })
    }, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });

  console.log('race', race);
  console.log('results', results);
  
  await browser.close();
    
})().catch((e) => console.error(e));