const puppeteer = require('puppeteer');
const contentful = require('contentful-management');
const chalk = require('chalk');
const Logger = require('./Logger');

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

// TODO: Validate this
const seasonId = process.argv[2];

(async () => {
	const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID);
  const drivers = await environment.getEntries({ content_type: "driver", limit: 500 });
  
	const browser = await puppeteer.launch({ 
		executablePath: '/usr/bin/google-chrome-stable', 
		headless: true, 
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});
  const page = await browser.newPage();
  
  console.log(`${chalk.bold('Loading')} standings for season ID ${chalk.magenta(seasonId)}...`);
  
  // TODO: build an error handler for non-200 responses
  await page.goto(`http://www.danlisa.com/scoring/season_standings.php?season_id=${seasonId}`);
  
  console.log(`${chalk.bold('Parsing')} standings for season ID ${chalk.magenta(seasonId)}...`);
  const standings = await page.$$eval('#driver_table tr:not(.jsTableHdr)', rows => {
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText);
      return {
        position: cells[0],
        change: cells[1],
        driver: cells[2],
        starts: cells[3],
        provisionals: cells[4],
        racesCounted: cells[5],
        wins: cells[6],
        t5s: cells[7],
        t10s: cells[8],
        points: cells[9],
        bonus: cells[10],
        penalty: cells[11],
        laps: cells[12],
        incidents: cells[13],
        behindLeader: cells[14],
        behindNext: cells[15],
      }
    })
  });
  
  console.log(`${chalk.bold('Saving')} standings for season ID ${chalk.magenta(seasonId)}...`);
  try {
    const entry = await environment.getEntry(seasonId);
    entry.fields.standings = { 'en-US': standings };
    const updatedEntry = await entry.update();
    await updatedEntry.publish();
    console.log(`${chalk.bold('Updated')} standings for season ID ${chalk.magenta(seasonId)}.`);
  } catch(err) {
    console.error(err);
  }
  
  await browser.close();
    
})().catch((e) => console.error(e));

function localize(obj) {
  for (key in obj)
    obj[key] = { 'en-US' : obj[key] }
  return obj
}