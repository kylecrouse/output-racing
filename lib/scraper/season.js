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
    async (event) => (event.uploaded && event.raceId) 
      ? await importResults(event.raceId, { name: event.name })
      : event,
    { concurrency: 3 }
  ).then(entries => entries
    .filter(entry => entry.sys)
    .map(entry => ({ sys: { type: "Link", linkType: "Entry", id: entry.sys.id }}))
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

  // Update the season with new data or return null if invalid season
  return (existing) ? existing.put({ ...season, results, standings, stats }) : null;

}

// Allow this script to be run from the command line or as a module
if (process.argv[2]) {
  return importSeason(process.argv[2]);
} else {
  module.exports = importSeason;
}