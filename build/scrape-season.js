const puppeteer = require('puppeteer');
const contentful = require('contentful-management');
const Promise = require('bluebird');
const { exec, spawn } = require('child_process');
const fetch = require('node-fetch');
const parse = require('csv-parse');
const log = require('log-update');
const chalk = require('chalk');
const { tracks } = require('../constants');

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

// TODO: Validate this
const seasonId = process.argv[2];

(async () => {
  const space = await client.getSpace('38idy44jf6uy');
  const environment = await space.getEnvironment('master');
  const drivers = await environment.getEntries({ content_type: "driver", limit: 500 });
  
  const browser = await puppeteer.launch();
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
      // Add a new header for navigation request.
      const headers = req.headers();
      headers['Cookie'] = "tzid=54";
      req.continue({ headers });
    });
  });

  console.log(`${chalk.bold('Loading schedule')} for season ID ${chalk.magenta(seasonId)}...`);
  
  await page.goto(`http://www.danlisa.com/scoring/season_schedule.php?season_id=${seasonId}`);

  const events = await page.$$eval(
    '#sched_table [id^=sch_].bgGray a[href^="season_race.php"]', 
    cells => cells.map(cell => cell.href.split('=').pop())
  );
  
  // TODO: build an error handler for non-200 responses
  await page.goto(`http://www.danlisa.com/scoring/season_schedule_export.php?season_id=${seasonId}`);

  const response = await request;
  const csv = await response.text();
  
  console.log(`${chalk.bold('Parsing schedule')} for season ID ${chalk.magenta(seasonId)}...`);
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
        counts: record['Points Count'] === 'Yes',
        raceId: record['Results Uploaded'] === 'Yes'
          ? events.shift()
          : null,
        name: record['Off Week'] !== 'Yes'
          ? record['Event Name']
            ? record['Event Name']
            : `Ouput Racing ${record['Track Type'] === 'Short Track' ? record['Laps'] : parseInt(record['Distance (Miles)'])}`
          : 'Off Week',
        track: record['Track'],
        type: record['Track Type'],
        time: record['Time'],
        laps: record['Laps'],
        distance: record['Distance (Miles)']
      })
    }, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
  
  console.log(`${chalk.bold('Processing results')} for season ID ${chalk.magenta(seasonId)}...`, schedule);
  const colors = {
    waiting: 'gray',
    working: 'white',
    ignored: 'white',
    completed: 'white',
    error: 'red'
  };
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIndex = -1;
  const spinners = Object.assign(
    ...schedule
      .filter(event => event.raceId && event.uploaded)
      .map(event => ({ [event.raceId]: { state: "waiting", text: `Queued ${event.raceId}...` }}))
  );	
  const loop = setInterval(() => {
    frameIndex = frameIndex + 1 >= frames.length ? 0 : frameIndex + 1;
    log(Object.values(spinners).map(
      ({ text, state }) => chalk[colors[state]](`${state === "working" ? frames[frameIndex] + ' ' : state === "waiting" ? '🏴' : state === "error" ? '🛑': '🏁'} ${text}`)).join(`\n`)
    );
  }, 80);
  
  let results = [];
  await Promise.map(schedule, event => {
    return new Promise(async (resolve, reject) => {
      if (event.uploaded && event.raceId) {
        spinners[event.raceId] = { 
          state: "working", 
          text: `${chalk.bold('Spawning')} scraper for race ID ${chalk.magenta(event.raceId)}...` 
        };
        const yarn = spawn('yarn', ['race', event.raceId, event.name]);
        yarn.stdout.on('data', (data) => { 
          spinners[event.raceId].text = data.toString().replace(/\r?\n|\r/g, ''); 
        });
        yarn.stderr.on('data', (data) => { 
          spinners[event.raceId] = { state: "error", text: `[${event.raceId}] ${data.toString().replace(/\r?\n|\r/g, '')}` }; 
        });
        yarn.on('close', (code) => {
          results.push(link(event.raceId));
          spinners[event.raceId] = { state: "completed", text: `${chalk.bold('Finished')} processing ${chalk.magenta(event.name)}` }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }, { concurrency: 1 }); 
  
  clearInterval(loop);
  log.done();
  
  console.log(`${chalk.bold('Saving')} season ID ${chalk.magenta(seasonId)}...`);
  try {
    const entry = await environment.getEntry(seasonId);
    entry.fields = Object.assign({}, entry.fields, localize({ ...season, schedule, results }));
    const updatedEntry = await entry.update();
    await updatedEntry.publish();
    console.log(`${chalk.bold('Updated')} season ID ${chalk.magenta(seasonId)}.`);
  } catch(err) {
    if (err.name === 'NotFound') {
      const entry = await environment.createEntryWithId('season', seasonId, { 
        fields: localize({ ...season, schedule, results }) 
      });
      await entry.publish();
      console.log(`${chalk.bold('Added')} season ID ${chalk.magenta(seasonId)}.`);
    } else {
      console.error(err);
    }
  }
  
  await new Promise((resolve, reject) => {
    const yarn = spawn('yarn', ['standings', seasonId]);
    yarn.stdout.on('data', (data) => { 
      console.log(data.toString().replace(/\r?\n|\r/g, ''));
    });
    yarn.stderr.on('data', (data) => { 
      console.error(data.toString().replace(/\r?\n|\r/g, ''));
    });
    yarn.on('close', (code) => {
      resolve();
    });
  });
  
  await new Promise((resolve, reject) => {
    const yarn = spawn('yarn', ['stats', 'season_id', seasonId]);
    yarn.stdout.on('data', (data) => { 
      console.log(data.toString().replace(/\r?\n|\r/g, ''));
    });
    yarn.stderr.on('data', (data) => { 
      console.error(data.toString().replace(/\r?\n|\r/g, ''));
    });
    yarn.on('close', (code) => {
      resolve();
    });
  });
  
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