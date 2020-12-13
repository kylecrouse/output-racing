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
      const driver = await league.mapDriver(item.name);
      return { ...item, id: driver.id };
    })
  );

  // Get the existing race
  const [existing] = await league.getRace(raceId);

  if (existing) {
    
    // Don't overwrite the name of existing races, to prevent changing manual edits.
    const { name, ...fields } = race;
    
    // Update the race with new data
    return existing.put({ ...fields, ...overrides });

  }
  
  // Create a new race for this event
  else
    return league.createRace({ raceId: parseInt(raceId, 10), ...race, ...overrides });
}

// Allow this script to be run from the command line or as a module
if (process.argv[2]) {
  return importResults(process.argv[2]);
} else {
  module.exports = importResults;
}