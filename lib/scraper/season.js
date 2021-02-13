const Promise = require('bluebird');
const league = require('../league');
const danlisa = require('../../lib/danlisa');
const importResults = require('./results');

async function importSeason(seasonId) {
  
  // Ensure the league is instantiated
  await league.init();
  
  // Import the requested standings from danlisa.com
  let [season, standings, stats] = await Promise.all([
    danlisa.getSchedule(seasonId),
    danlisa.getStandings(seasonId),
    danlisa.getSeasonStats(seasonId)
  ]);
  
  let results = await Promise.map(
    season.schedule, 
    (event) => (event.uploaded && event.raceId) 
      ? importResults(event.raceId, event.scheduleId, { name: event.name, uploaded: !!event.uploaded })
      : !event.offWeek
        ? league.mapScheduledRace({ 
            ...event,
            scheduleId: parseInt(event.scheduleId, 10),
            raceNo: parseInt(event.raceNo, 10),
            laps: parseInt(event.laps, 10)
          })
        : event,
    { concurrency: 1 }
  ).then(entries => entries
    .filter(entry => entry.id)
    .map(entry => ({ sys: { type: "Link", linkType: "Entry", id: entry.id }}))
  );
  
  // Resolve driver names from standings to league drivers
  standings = await Promise.all(
    standings.map(async (item) => {
      const driver = await league.mapDriver(item.driver);
      return { ...item, id: driver.id };
    })
  );

  // Resolve driver names from stats to league drivers
  stats = await Promise.all(
    stats.map(async (item) => {
      const driver = await league.mapDriver(item.driver);
      return { ...item, id: driver.id };
    })
  );

  // Get the existing race
  const existing = await league.getSeason(seasonId);
  
  if (existing) {
    // Update the season with new data, excluding season name
    const { name, ...rest } = season;
    return existing.put({ ...rest, results, standings, stats });
  }
  else
    // Create new season from data
    return league.addSeason(seasonId, { ...season, results, standings, stats });


}

// Allow this script to be run from the command line or as a module
if (process.argv[1] && process.argv[1].match(/season.js/)) {
  try {
    importSeason(process.argv[2]);
  } catch(error) {
    console.error(error);
  }
} else {
  module.exports = importSeason;
}