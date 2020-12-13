const Promise = require('bluebird');
const _ = require('lodash');
const league = require('../league');
const iracing = require('../iracing');
const Driver = require('../contentful/driver');

async function importDrivers(leagueId) {
  
  // Ensure the league is instantiated
  await league.init();
  
  // Get active drivers from iRacing league roster
  const members = await iracing.getDrivers(leagueId);
  
  // Iterate through active drivers to update/create
  await Promise.map(
    members, 
    async (member) => {
      console.log(`Processing ${member.displayName}...`);
      // Get license and stats for active drivers
      const { license, stats: careerStats } = await iracing.getCareerStats(member.custID);
      const props = {
  			name: member.displayName,
  			nickname: member.driver_nickname,
  			number: member.car_number,
  			custId: member.custID,
  			active: true,
  			license,
  			careerStats
      };
      // Get matching driver record
      const [existing] = league.drivers.filter(driver => driver.custId === member.custID);
      console.log(existing ? `Updating ${existing.name}...` : `Creating ${props.name}...`);
      // Update props for existing, or create a new driver
      return existing ? existing.put(props) : Driver.create(props);
    }, 
    { concurrency: 3 }
  );
  
  // Update remaining drivers to be inactive
  await Promise.map(
    _.differenceWith(league.drivers, members, (a, b) => a.custId === b.custID),
    (driver) => {
      console.log(`Deactivating ${driver.name}...`);
      return driver.put({ active: false });
    },
    { concurrency: 1 }
  );
  
}

// Allow this script to be run from the command line or as a module
if (process.argv[2]) {
  return importDrivers(process.argv[2]);
} else {
  module.exports = importDrivers;
}