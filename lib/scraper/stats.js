const league = require('../league');
const danlisa = require('../../lib/danlisa');

async function importStats(type, id) {
  
  // Ensure the league is instantiated
  await league.init();
  
  // Import the requested stats from simracerhub.com
  let stats = type === 'season' 
    ? await danlisa.getSeasonStats(id)
    : await danlisa.getLeagueStats(id);
  
  // Resolve driver names from stats to league drivers
  stats = await Promise.all(
    stats.map(async (item) => {
      const driver = await league.mapDriver(item.driver);
      return { ...item, id: driver.id };
    })
  );

  if (type === 'season') {
    
    // Get the existing race
    const existing = await league.getSeason(id);
  
    // Update the season with new data or return null if invalid season
    return (existing) ? existing.put({ stats }) : null;

  }
  
  else
    // Update the league with new data
    return league.put({ stats });

}

// Allow this script to be run from the command line or as a module
if (process.argv[2]) {
  return importStats(process.argv[2]);
} else {
  module.exports = importStats;
}
