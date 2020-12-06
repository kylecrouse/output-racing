const league = require('../league');
const danlisa = require('../../lib/danlisa');

async function importResults(raceId, overrides) {
  
  // Ensure the league is instantiated
  await league.init();
  
  // Import the requested results from danlisa.com
  const race = await danlisa.getResults(raceId);
  
  // Resolve driver names from results to league drivers
  race.results = await Promise.all(
    race.results.map(async (item) => {
      // Match driver to record or create a new one
      const driver = league.findDriver({ field: 'name', value: item.name })
        || await league.createDriver({ name: item.name, active: false });
      return { ...item, id: driver.sys.id };
    })
  );

  // Get the existing race
  const [existing] = await league.getRace(raceId);

  if (existing) {
    
    // Don't overwrite the name of existing races, to prevent changing manual edits.
    const { name, ...fields } = race;
    
    // Update the race with new data
    return league.updateRace(existing, { ...fields, ...overrides });

  }
  
  else {
    
    // Create a new race for this event
    return league.createRace({ raceId: parseInt(raceId, 10), ...race, ...overrides });
    
  }
}

// Allow this script to be run from the command line or as a module
if (process.argv[2]) {
  return importResults(process.argv[2]);
} else {
  module.exports = importResults;
}