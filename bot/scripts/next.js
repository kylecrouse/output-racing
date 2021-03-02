const client = require('../lib/discord');
const league = require('../../lib/league');
const { announcementChannelId } = require('../config.json');
const { getUpcomingEmbed } = require('../lib/embeds');

if (client.uptime > 0) {
  main();
} else {
  client.on('ready', main);
}

async function main() {
  console.log(`Logged in as ${client.user.tag} for scripts/next.`);
  
  await league.init();

  const race = league.getNextRace();
  
  if (!race || race.offWeek /*|| !moment().isSame(race.date, 'day')*/) 
    process.exit(0);
  else
    await client.channels.cache.get(announcementChannelId).send("@everyone", getUpcomingEmbed(league));
  
  process.exit(0);
}
