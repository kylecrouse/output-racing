const client = require('../lib/discord');
const league = require('../../lib/league');
const iracing = require('../../lib/iracing');
const { announcementChannelId } = require('../config.json');
const { getSessionEmbed } = require('../lib/embeds');
const moment = require('moment');

if (client.uptime > 0) {
  main();
} else {
  client.on('ready', main);
}

async function main() {
  console.log(`Logged in as ${client.user.tag} for scripts/next.`);
  
  // Get scheduled sessions for the league from iRacing
  const sessions = await iracing.getLeagueSessions(2732);
  
  // Ensure league data is ready to go
  await league.init();
  
  // Get Discord channel to send announcement
  // const user = (await client.users.cache.get('697817102534311996')) || (await client.users.fetch('697817102534311996'));
  // const channel = await user.createDM();  
  const channel = (await client.channels.cache.get(announcementChannelId)) || (await client.channels.fetch(announcementChannelId))

  await Promise.all(sessions
    .filter(session => moment().isSame(session.launchat, 'day'))
    .map(async (session) => {
      const race = league.getNextRace({ track: decodeURIComponent(session.track_name) });
      console.log(session);
      return channel.send(await getSessionEmbed(session, race));
    })
  );
  
  process.exit(0);
}
