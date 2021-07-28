const Promise = require('bluebird');
const fetch = require('node-fetch');
const _ = require('lodash');
const iracing = require('../iracing');
// const importResults = require('./results');

async function importSeason(leagueId, seasonId) {
  
  return Promise.map(
    seasonId 
      ? iracing.getSeason(leagueId, seasonId) 
      : iracing.getAllSeasons(leagueId), 
    async (s) => {

      const payload = {
        name: s.league_season_name,
        seasonId: s.league_season_id,
        active: !!s.active,
        sessions: await importSessions(leagueId, s.league_season_id)
      };
      
      let [season] = await getSeason(s.league_season_id);      
      season = season
        ? await updateSeason(season.id, payload) 
        : await createSeason(payload);
      
    },
    { concurrency: 1 }
  );
  
}

async function importSessions(leagueId, seasonId) {
  return Promise.map(
    iracing.getSeasonSchedule(leagueId, seasonId), 
    (session) => importSession(session.subsessionid),
    { concurrency: 1 }
  );
}

async function importSession(subsessionId) {
  const data = await iracing.getSubsession(subsessionId);
  const [track] = await getTrack(data.trackid);
  
  const payload = {
    subsessionId: data.subsessionid,
    cautions: data.ncautions,
    cautionLaps: data.ncautionlaps,
    leadChanges: data.nleadchanges,
    laps: data.eventlapscomplete,
    track: track.id,
    date: data.start_time,
    timeOfDay: getTimeOfDay(data.timeofday)
  };
  
  let [session] = await getSession(data.subsessionid);  
  session = session 
    ? await updateSession(session.id, payload) 
    : await createSession(payload);
  
  const results = await Promise.map(
    data.rows,
    async (row) => {
      let [driver] = await getDriver(row.custid);
      if (!driver) 
        driver = await createDriver({ 
          custId: row.custid, 
          name: decodeURIComponent(row.displayname)
        });
        
      const [car] = await getCar(row.carid);
      
      const [result] = await getResult(session.id, driver.id, row.type);
      const payload = {
        driver: driver.id,
        car: car.id,
        start: row.startpos,
        finish: row.finishpos,
        reason: row.reasonout,
        interval: row.interval,
        laps: row.lapscomplete,
        led: row.lapslead,
        avgLapTime: row.avglap,
        fastLapTime: row.bestlaptime,
        fastLapNum: row.bestlapnum,
        inc: row.incidents,
        type: row.simsesname,
        session: session.id
      };
      if (!result)
        return createResult(payload);
      else 
        return updateResult(result.id, payload);
    },
    { concurrency: 1 }
  );
  
  session = await updateSession(session.id, { 
    cars: _.uniqBy(results, 'car').map(({ car }) => car),
    sessions: Object.entries(_.groupBy(results, 'type'))
      .map(([key, val]) => ({
        "__component": "stat.result",
        type: key, 
        results: val.sort((a, b) => a.finish - b.finish).map(({ id }) => id)
      }))
  });
  
  return session.id;  
}

// async function importSeason(seasonId) {
//   
//   // Ensure the league is instantiated
//   await league.init();
//   
//   // Import the requested standings from simracerhub.com
//   let [season, standings, stats] = await Promise.all([
//     danlisa.getSchedule(seasonId),
//     danlisa.getStandings(seasonId),
//     danlisa.getSeasonStats(seasonId)
//   ]);
//   
//   let results = await Promise.map(
//     season.schedule, 
//     (event) => (event.uploaded && event.raceId) 
//       ? importResults(event.raceId, event.scheduleId, { name: event.name, uploaded: !!event.uploaded })
//       : !event.offWeek
//         ? league.mapScheduledRace({ 
//             ...event,
//             scheduleId: parseInt(event.scheduleId, 10),
//             raceNo: parseInt(event.raceNo, 10),
//             laps: parseInt(event.laps, 10)
//           })
//         : event,
//     { concurrency: 1 }
//   ).then(entries => entries
//     .filter(entry => entry.id)
//     .map(entry => ({ sys: { type: "Link", linkType: "Entry", id: entry.id }}))
//   );
//   
//   // Resolve driver names from standings to league drivers
//   standings = await Promise.all(
//     standings.map(async (item) => {
//       const driver = await league.mapDriver(item.driver);
//       return { ...item, id: driver.id };
//     })
//   );
// 
//   // Resolve driver names from stats to league drivers
//   stats = await Promise.all(
//     stats.map(async (item) => {
//       const driver = await league.mapDriver(item.driver);
//       return { ...item, id: driver.id };
//     })
//   );
// 
//   // Get the existing race
//   const existing = await league.getSeason(seasonId);
//   
//   if (existing) {
//     // Update the season with new data, excluding season name and schedule
//     const { name, ...rest } = season;
//     return existing.put({ ...rest, results, standings, stats });
//   }
//   else
//     // Create new season from data
//     return league.addSeason(seasonId, { ...season, results, standings, stats });
// 
// 
// }

// Allow this script to be run from the command line or as a module
if (process.argv[1] && process.argv[1].match(/season.js/)) {
  try {
    importSeason(process.argv[2], process.argv[3]);
  } catch(error) {
    console.error(error);
  }
} else {
  module.exports = importSeason;
}

function getTimeOfDay(val) {
  switch(val) {
    case 5:
      return 'sunrise';
    case 1:
      return 'morning';
    case 9:
      return 'noon';
    case 0:
      return 'afternoon';
    case 2:
      return 'lateafternoon';
    case 8:
      return 'sunset';
    case 3:
      return 'night';
  }
}

function createDriver(props) {
  return createRecord('drivers', props);
}

function getDriver(custId) {
  return getRecord('drivers', `custId=${custId}`);
}

function createSeason(props) {
  return createRecord('seasons', props);
}

function getSeason(seasonId) {
  return getRecord('seasons', `seasonId=${seasonId}`);
}

function updateSeason(id, props) {
  return updateRecord('seasons', id, props);
}

function createSession(props) {
  return createRecord('sessions', props);
}

function getSession(subsessionId) {
  return getRecord('sessions', `subsessionId=${subsessionId}`);
}

function updateSession(id, props) {
  return updateRecord('sessions', id, props);
}

function getTrack(trackId) {
  return getRecord('tracks', `trackId=${trackId}`);
}

function getCar(carId) {
  return getRecord('cars', `carId=${carId}`);
}

function createResult(props) {
  return createRecord('results', props);
}

function getResult(session, driver, type) {
  return getRecord('results', `session.id=${session}&&driver.id=${driver}&&type=${type}`);
}

function updateResult(id, props) {
  return updateRecord('results', id, props);
}

function getRecord(collection, query) {
  return fetch(`http://localhost:1337/${collection}?${query}`)
    .then(res => res.json())
    // .then(res => {
    //   console.log({res});
    //   return res;
    // })
    .catch(err => console.log(err));
}

function createRecord(collection, props) {
  return fetch(`http://localhost:1337/${collection}`, { 
      method: 'post',
      body: JSON.stringify(props),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(res => {
      if (res.statusCode && res.statusCode !== 200)
        throw Object.assign(
          new Error(`Failed to create record in ${collection}`), 
          { res, props }
        );
      console.log(`Created ${res.id} in ${collection}`/*, res*/);
      return res;
    })
    .catch(err => console.log(err));
}

function updateRecord(collection, id, props) {
  return fetch(`http://localhost:1337/${collection}/${id}`, { 
      method: 'put',
      body: JSON.stringify(props),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(res => {
      if (res.statusCode && res.statusCode !== 200)
      throw Object.assign(
        new Error(`Failed to update record ${id} in ${collection}`), 
        { res, props }
      );
      console.log(`Updated ${id} in ${collection}`/*, res*/);
      return res;
    })
    .catch(err => console.log(err));
}