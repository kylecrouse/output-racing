const puppeteer = require('puppeteer');
const contentful = require('contentful-management');
const chalk = require('chalk');
const Logger = require('./Logger');

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

(async () => {
  const space = await client.getSpace('38idy44jf6uy');
  const environment = await space.getEnvironment('master');
  const drivers = await environment.getEntries({ content_type: "driver" });
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  console.log(`${chalk.bold('Loading')} stats...`);
  
  const statsKey = process.argv[2];
  const statsVal = process.argv[3];
  
  // TODO: build an error handler for non-200 responses
  await page.goto(`http://www.danlisa.com/scoring/league_stats.php?${statsKey}=${statsVal}`);
  
  const statsName = await page.$eval('.pageTitleRight', el => el.innerHTML.replace(/Output Racing<br>/i, '').replace('<br>', ' '));

  console.log(`${chalk.bold('Parsing')} stats for ${chalk.magenta(statsName)}...`);
  const stats = await page.evaluate(() => {
    const sel = document.querySelector('#page_controls select');
    sel.selectedIndex = sel.options.length - 1;
    setPagesize(sel);
    return Array.from(document.querySelectorAll('#stat_table tbody tr')).map(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText);
      return {
        driver: cells[1],
        races: cells[2],
        starts: cells[3],
        provisionals: cells[4],
        poles: cells[5],
        polePercentage: cells[6],
        avgStart: cells[7],
        wins: cells[8],
        winPercentage: cells[9],
        avgFinish: cells[10],
        top5s: cells[11],
        top5Percentage: cells[12],
        top10s: cells[13],
        top10Percentage: cells[14],
        laps: cells[15],
        lapsLed: cells[16],
        miles: cells[17],
        incidents: cells[18],
        incidentsRace: cells[19],
        incidentsLap: cells[20]
      };
    });
  });
  
  console.log(`${chalk.bold('Saving')} stats for ${chalk.magenta(statsName)}...`);
  try {
    const entry = await environment.getEntry(statsVal);
    entry.fields.stats = { 'en-US': stats };
    const updatedEntry = await entry.update();
    await updatedEntry.publish();
    console.log(`${chalk.bold('Updated')} stats for ${chalk.magenta(statsName)}.`);
  } catch(err) {
    console.error(err);
  }
  
  await browser.close();
    
})().catch((e) => console.error(e));
