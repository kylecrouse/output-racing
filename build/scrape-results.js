const puppeteer = require('puppeteer');
const contentful = require('contentful-management');
const { exec } = require('child_process');
const fetch = require('node-fetch');
const parse = require('csv-parse');
const chalk = require('chalk');
const { tracks } = require('../constants');

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

// TODO: Validate this
const raceId = process.argv[2];

(async () => {
  const space = await client.getSpace('38idy44jf6uy');
  const environment = await space.getEnvironment('master');
  const drivers = await environment.getEntries({ content_type: "driver", limit: 500 });
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  
  console.log(`${chalk.bold('Loading')} results for race ID ${chalk.magenta(raceId)}...`);
  
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
  
  console.log(`${chalk.bold('Parsing race info')} for race ID ${chalk.magenta(raceId)}...`);
  const race = await new Promise((resolve, reject) => {
    parse(csv, {
      relax_column_count: true,
      from_line: 1,
      to_line: 11,
      on_record: record => record[1]
    }, (err, output) => {
      if (err) reject(err);
      else resolve({
        name: process.argv.length >= 4 ? process.argv[3] : 'Unsponsored',
        // league: output[0],
        // series: output[1],
        // season: output[2],
        date: new Date(output[3]),
        track: output[4],//tracks.find(track => output[4].indexOf(track.name) >= 0).id.toString(),
        laps: parseInt(output[5], 10),
        duration: output[6],
        cautions: parseInt(output[7], 10),
        cautionLaps: parseInt(output[8], 10),
        leadChanges: parseInt(output[9], 10),
        leaders: parseInt(output[10], 10)
      });
    })
  });
  
  // TODO: Create (deactivated?) records for unknown drivers
  console.log(`${chalk.bold('Parsing race results')} for race ID ${chalk.magenta(raceId)}...`);
  const results = await new Promise((resolve, reject) => {
    parse(csv, {
      relax_column_count: true,
      columns: true,
      from_line: 12,
      on_record: (record, context) => ({
        id: (name => {
          const driver = drivers.items.find(driver => driver.fields.name['en-US'] === name);
          return driver ? driver.sys.id : null;
        })(record['Driver']),
        name: record['Driver'],
        // car: record['Car'],
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
      else {
        resolve(Promise.all(output.map(async (item) => {
          // Driver matched; return results
          if (item.id) return item;
          // No driver match; wait for a new record to be created
          else {
            console.log(`${chalk.bold('Adding')} entry for ${chalk.magenta(item.name)}...`);
            const entry = await environment.createEntry('driver', { fields: localize({
              name: item.name,
              active: false
            }) });
            await entry.publish();
            return { ...item, id: entry.sys.id };
          }
        })));
      }
    });
  });
  
  console.log(`${chalk.bold('Saving entries')} for race ID ${chalk.magenta(raceId)}...`);
  try {
    const entry = await environment.getEntry(raceId);
    if (entry) {
      // Don't overwrite the name of existing events, to prevent changing manual edits.
      const { name, ...rest } = race;
      entry.fields = Object.assign({}, entry.fields, localize({ ...rest, results }));
      const updatedEntry = await entry.update();
      await updatedEntry.publish();
      console.log(`${chalk.bold('Updated results')} for race ID ${chalk.magenta(raceId)}.`);
    }
  } catch(err) {
    if (err.name === 'NotFound') {
      const entry = await environment.createEntryWithId('race', raceId, { fields: localize({ ...race, results }) });
      await entry.publish();
      console.log(`${chalk.bold('Added results')} for race ID ${chalk.magenta(raceId)}.`);
    } else {
      console.log(err);
    }
  }
  
  //log.done();
  
  await browser.close();
    
})().catch((e) => console.error(e));

function localize(obj) {
  for (key in obj)
    obj[key] = { 'en-US' : obj[key] }
  return obj
}