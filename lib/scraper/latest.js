const fs = require('fs').promises;
const league = require(`${process.cwd()}/lib/league`);
const iracing = require(`${process.cwd()}/lib/iracing`);
const danlisa = require(`${process.cwd()}/lib/danlisa`);

async function importLatest() {

  // Ensure data is available
  await league.init();

  // Get the next scheduled race for the league
  const race = await league.getNextRace();
  
  // If there aren't any more races, exit
  if (!race) throw new Error('No more races scheduled this season.');
  
  // Get the results source from iRacing for latest race  
  // TODO: Store iRacing league ID in CMS?
  await fs.writeFile('EventResult.html', await iracing.getLatestResults(2732));
  
  // Upload the results to next race at danlisa.com
  const raceId = await danlisa.putResults('EventResult.html', '143148'/*race.scheduleId*/);
  
  // Cleanup saved files
  await fs.unlink('EventResult.html');
  
  // Send back the next race data with new ID
  return { ...race, raceId };
  
}

// Allow this script to be run from the command line or as a module
if (process.argv[2]) {
  return importLatest(process.argv[2]);
} else {
  module.exports = importLatest;
}