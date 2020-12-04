const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const parse = require('csv-parse');
const cms = require('../contentful');
const { tracks } = require('../../constants');

async function importResults(raceId) {
  
	const browser = await puppeteer.launch({ 
		executablePath: '/usr/bin/google-chrome-stable', 
		headless: true, 
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});
	// const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  
  console.log(`Loading results for race ID ${raceId}...`);
  
	const request = new Promise(resolve => {
    page.on('request', req => {
      if (req.resourceType() === 'document' && req.url().substr(-4) === '.csv') {
        resolve(fetch(req._url, {
          encoding: null,
          method: req._method,
          headers: req._headers
        }));
      }
      req.continue();
    });
  });
  
  // TODO: build an error handler for non-200 responses
  await page.goto(`http://www.danlisa.com/scoring/season_race.php?race_id=${raceId}&csv=y`);
  
  const response = await request;
  const csv = await response.text();
  
  console.log(csv);
  process.exit();
  
  // console.log(`Parsing race info for race ID ${raceId}...`);
  // const race = await new Promise((resolve, reject) => {
  //   parse(csv, {
  //     relax_column_count: true,
  //     from_line: 1,
  //     to_line: 11,
  //     on_record: record => record[1]
  //   }, (err, output) => {
  //     if (err) reject(err);
  //     else resolve({
  //       name: process.argv.length >= 4 ? process.argv[3] : 'Unsponsored',
  //       // league: output[0],
  //       // series: output[1],
  //       // season: output[2],
  //       date: new Date(output[3]),
  //       track: output[4],//tracks.find(track => output[4].indexOf(track.name) >= 0).id.toString(),
  //       laps: parseInt(output[5], 10),
  //       duration: output[6],
  //       cautions: parseInt(output[7], 10),
  //       cautionLaps: parseInt(output[8], 10),
  //       leadChanges: parseInt(output[9], 10),
  //       leaders: parseInt(output[10], 10)
  //     });
  //   })
  // });
  // 
  // console.log(`Parsing race results for race ID ${raceId}...`);
  // const results = await new Promise((resolve, reject) => {
  //   parse(csv, {
  //     relax_column_count: true,
  //     columns: true,
  //     from_line: 12,
  //     on_record: (record, context) => ({
  //       id: (name => {
  //         const driver = drivers.items.find(driver => driver.fields.name['en-US'] === name);
  //         return driver ? driver.sys.id : null;
  //       })(record['Driver']),
  //       name: record['Driver'],
  //       // car: record['Car'],
  //       start: record['Start'],
  //       finish: record['Finish'],
  //       interval: record['Interval'],
  //       points: record['Race Points'],
  //       bonus: record['Bonus Points'],
  //       penalty: record['Penalty Points'],
  //       completed: record['Laps Completed'],
  //       led: record['Laps Led'],
  //       fastest: record['Fastest Lap'],
  //       average: record['Average Lap'],
  //       incidents: record['Incidents'],
  //       status: record['Status']
  //     })
  //   }, (err, output) => {
  //     if (err) reject(err);
  //     else {
  //       resolve(Promise.all(output.map(async (item) => {
  //         // Driver matched; return results
  //         if (item.id) return item;
  //         // No driver match; wait for a new record to be created
  //         else {
  //           console.log(`Adding entry for ${item.name}...`);
  //           const entry = await environment.createEntry('driver', { fields: localize({
  //             name: item.name,
  //             active: false
  //           }) });
  //           await entry.publish();
  //           return { ...item, id: entry.sys.id };
  //         }
  //       })));
  //     }
  //   });
  // });
}

// Allow this script to be run from the command line or as a module
if (process.argv[2]) {
  return importResults(process.argv[2]);
} else {
  module.exports = importResults;
}