const Promise = require('bluebird');
const client = require('../lib/discord');
const contentful = require('../../lib/contentful');
const iracing = require('../../lib/iracing');
const { getSessionEmbed } = require('../lib/embeds');
const moment = require('moment-timezone');

if (client.uptime > 0) {
  main();
} else {
  client.on('ready', main);
}

async function main() {
  console.log(`Logged in as ${client.user.tag} for scripts/next.`);
  
  try {
    
    await contentful.init();

    await Promise.map(
      contentful.get({ content_type: 'league' }), 
      async ({ fields: league }) => {
        
        // Get scheduled sessions for the league from iRacing
        const sessions = await iracing.getLeagueSessions(league.leagueId['en-US']);
        
        // Get Discord channel to send announcement
        // const user = (await client.users.cache.get('697817102534311996')) || (await client.users.fetch('697817102534311996'));
        // const channel = await user.createDM();  
        const channel = (await client.channels.cache.get(league.channels['en-US'].announcement)) 
          || (await client.channels.fetch(league.channels['en-US'].announcement).catch(err => {}));
        
        return Promise.all(sessions
          .filter(session => moment().tz("America/Los_Angeles").isSame(session.launchat, 'day'))
          .map(async (session) => {
            return channel.send('@everyone', await getSessionEmbed(session, { name: null, logo: null }));
          })
        );

      }, 
      { concurrency: 1 }
    );
    
  } catch(err) {
    console.log(err);
  }
  
  process.exit(0);
}
