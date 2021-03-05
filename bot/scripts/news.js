const client = require('../lib/discord');
const league = require('../../lib/league');
const iracing = require('../../lib/iracing');
const { getNewsEmbed } = require('../lib/embeds');
const moment = require('moment-timezone');

if (client.uptime > 0) {
  main();
} else {
  client.on('ready', main);
}

async function main() {
  console.log(`Logged in as ${client.user.tag} for scripts/news.`);
  
  await league.init();
  
  const user = (await client.users.cache.get('697817102534311996')) || (await client.users.fetch('697817102534311996'));

  // const channel = await user.createDM();  
  const channel = (await client.channels.cache.get('428309139496763395')) || (await client.channels.fetch('428309139496763395'))
  
  // const open = await iracing.getSeriesResults(3118, 3);
  // const fixed = await iracing.getSeriesResults(3119, 3); 
  // const results = open.concat(fixed);
  
  const results = await iracing.getSeriesResults(3122, 0); 

  const filtered = results.filter(
    r => moment.utc(r.start_time).tz("America/Los_Angeles").isSame(moment.utc().tz("America/Los_Angeles").subtract(1, 'day'), 'day')
  );
  
  const stats = await Promise.all(
    filtered.reduce(
      (stats, r) => {
        return stats.concat(
          r.rows
            .filter(i => i.simsesname == 'RACE' && league.drivers.filter(d => d.active).find(d => d.custId === i.custid))
            .map(i => iracing.getSeasonStandings(r.seasonid, r.carclassid, i.custid))
        )
      }, 
      []
    )
  );
  
  filtered.length > 0
    ? await channel.send(
        getNewsEmbed(
          filtered, 
          stats.map(s => s.r[0]), 
          league
        )
      )
    : await channel.send('No results found.');
  
  process.exit(0);
}