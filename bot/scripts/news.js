const client = require('../lib/discord');
const league = require('../../lib/league');
const iracing = require('../../lib/iracing');
const { getNewsEmbed } = require('../lib/embeds');
const moment = require('moment');

if (client.uptime > 0) {
  main();
} else {
  client.on('ready', main);
}

async function main() {
  console.log(`Logged in as ${client.user.tag} for scripts/news.`);

  await league.init();
  
  const user = (await client.users.cache.get('697817102534311996')) || (await client.users.fetch('697817102534311996'));
  const channel = await user.createDM();
  
  // const channel = (await client.channels.cache.get('428309139496763395')) || (await client.channels.fetch('428309139496763395'))
  
  const open = await iracing.getSeriesResults(3118);
  const fixed = await iracing.getSeriesResults(3119); 
  const results = open.concat(fixed);
  const filtered = results.filter(
    r => moment.utc(r.start_time).isSame(moment.utc(), 'day')
  )
  
  const stats = await Promise.all(
    filtered.reduce(
      (stats, r) => {
        return stats.concat(
          r.rows
            .filter(i => i.simsesname == 'RACE' && league.drivers.filter(d => d.active).find(d => d.custId === i.custid))
            .map(i => iracing.getSeasonStandings(r.seasonid, i.custid))
        )
      }, 
      []
    )
  );
  
  await channel.send(
    getNewsEmbed(
      filtered, 
      stats.map(s => s.r[0]), 
      league
    )
  );
  
  process.kill(process.pid, 'SIGTERM');
}