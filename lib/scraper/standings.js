const league = require('../league');
const danlisa = require('../../lib/danlisa');

async function importStandings(seasonId) {
  
  // Ensure the league is instantiated
  await league.init();
  
  // Import the requested standings from danlisa.com
  const standings = await danlisa.getStandings(seasonId);
  
  // Resolve driver names from standings to league drivers
  standings = await Promise.all(
    standings.map(async (item) => {
      const driver = await league.mapDriver(item.driver);
      return { ...item, id: driver.sys.id };
    })
  );

  // Get the existing race
  const [existing] = await league.getSeason(seasonId);

  // Update the season with new data or return null if invalid season
  return (existing) ? league.updateSeason(existing, { standings }) : null;

}

// Allow this script to be run from the command line or as a module
if (process.argv[2]) {
  return importStandings(process.argv[2]);
} else {
  module.exports = importStandings;
}