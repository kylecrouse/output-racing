const puppeteer = require('puppeteer');
const contentful = require('contentful-management');
const Promise = require('bluebird');
const { exec } = require('child_process');
const fetch = require('node-fetch');
const parse = require('csv-parse');
const chalk = require('chalk');
const Logger = require('./Logger');

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

// TODO: Validate this
const seasonId = process.argv[2];

(async () => {
  const space = await client.getSpace('38idy44jf6uy');
  const environment = await space.getEnvironment('master');
  const drivers = await environment.getEntries({ content_type: "driver" });
  
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  
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

  const log = new Logger(`${chalk.bold('Loading')} schedule for season ID ${chalk.magenta(seasonId)}...`);
  
  await page.goto(`http://www.danlisa.com/scoring/season_schedule.php?season_id=${seasonId}`);
  const events = await page.$$eval(
    '#sched_table [id^=sch_] td:nth-child(2), #sched_table [id^=sch_] td:nth-child(8)', 
    cells => cells
      .map(cell => cell.innerHTML)
      .reduce((acc, cur, idx, src) => { 
        cur !== '&nbsp;' && idx % 2 === 0 
          && acc.push({ date: cur, id: src[idx+1].toString().match(/race_id=(\d+)/) }); 
        return acc; 
      }, [])
      .map(({ date, id }) => ({ date, id: id ? id.pop() : null }))
  );
  
  // TODO: build an error handler for non-200 responses
  await page.goto(`http://www.danlisa.com/scoring/season_schedule_export.php?season_id=${seasonId}`);

  const response = await request;
  const csv = await response.text();
  
  log.update(`${chalk.bold('Parsing schedule')} for season ID ${chalk.magenta(seasonId)}...`);
  const season = await new Promise((resolve, reject) => {
    parse(csv, {
      relax_column_count: true,
      from_line: 1,
      to_line: 3,
      on_record: record => record[1]
    }, (err, output) => {
      if (err) reject(err);
      else resolve({ name: `${output[1]} ${output[2]}` });
    });
  });
  
  const schedule = await new Promise((resolve, reject) => {
    parse(csv, {
      relax_column_count: true,
      columns: true,
      from_line: 4,
      on_record: (record, context) => ({
        raceNo: record['Race #'],
        date: new Date(record['Race Date']),
        offWeek: record['Off Week'] === 'Yes',
        uploaded: record['Results Uploaded'] === 'Yes',
        raceId: events.find(({ date }) => date === record['Race Date']).id,
        name: record['Event Name'].replace('Sponsor: ', ''),
        track: record['Track'],
        time: record['Time'],
        laps: record['Laps'],
        distance: record['Distance (Miles)']
      })
    }, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
  
  log.update(`${chalk.bold('Processing results')} for season ID ${chalk.magenta(seasonId)}...`);
  let results = [];
  await Promise.map(schedule, event => {
    return new Promise(async (resolve, reject) => {
      if (event.uploaded && event.raceId) {
        exec(`yarn race ${event.raceId}`, (error, stdout, stderr) => {
          if (error) reject(error);
          else {
            results.push(event.raceId);
            resolve(stdout);
          }
        });
      }
    });
  }, { concurrency: 3 }); 
  results = results.map(id => link(id));
  
  // TODO: Fetch standings (as new process?)

  log.update(`${chalk.bold('Saving')} season ID ${chalk.magenta(seasonId)}...`);
  try {
    const entry = await environment.getEntry(seasonId);
    if (entry) {
      entry.fields = localize({ ...season, schedule, results });
      const updatedEntry = await entry.update();
      await updatedEntry.publish();
      log.success(`${chalk.bold('Updated')} season ID ${chalk.magenta(seasonId)}.`);
    }
  } catch(err) {
    if (err.name === 'NotFound') {
      const entry = await environment.createEntryWithId('season', seasonId, { 
        fields: localize({ ...season, schedule, results }) 
      });
      await entry.publish();
      log.success(`${chalk.bold('Added')} season ID ${chalk.magenta(seasonId)}.`);
    } else {
      log.error(err);
    }
  }
  
  log.done();
  
  await browser.close();
    
})().catch((e) => console.error(e));

function localize(obj) {
  for (key in obj)
    obj[key] = { 'en-US' : obj[key] }
  return obj
}

function link(id) {
  return { sys: { type: "Link", linkType: "Entry", id }}
}