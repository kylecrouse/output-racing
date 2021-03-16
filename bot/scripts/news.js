const client = require('../lib/discord');
const league = require('../../lib/league');
const iracing = require('../../lib/iracing');
const { getNewsEmbed } = require('../lib/embeds');
const moment = require('moment-timezone');
const Promise = require('bluebird');

if (client.uptime > 0) {
  main();
} else {
  client.on('ready', main);
}

async function main() {
  console.log(`Logged in as ${client.user.tag} for scripts/news.`);
  
  await league.init();
  
  const user = (await client.users.cache.get('697817102534311996')) || (await client.users.fetch('697817102534311996'));

  // TODO: Make channel a toggle based on NODE_ENV
  // const channel = await user.createDM();  
  const channel = (await client.channels.cache.get('428309139496763395')) || (await client.channels.fetch('428309139496763395'))
  
  // TODO: Is it possible to calculate the raceweek index from schedule so it can be automated?
  
  const series = [
    [{ seasonid: 3118, raceweek: 5 }, { seasonid: 3119, raceweek: 5 }],
    [{ seasonid: 3122, raceweek: 1 }]
  ];
  
  const results = await Promise.all(series.map(series => Promise.map(
    series, 
    ({ seasonid, raceweek }) => iracing.getSeriesResults(seasonid, raceweek), 
    { concurrency: 1 }
  ).then(results => results.flat().filter(
    r => moment.utc(r.start_time).tz("America/Los_Angeles").isSame(moment.utc().tz("America/Los_Angeles").subtract(1, 'day'), 'day')
  ))));
  
  await Promise.all(results.map(async (results) => {
    if (results.length <= 0) return;
    
    const stats = await Promise.reduce(
      results,
      (merged, r) => Promise.map(
        r.rows.filter(
          i => i.simsesname == 'RACE' && league.drivers.filter(d => d.active).find(d => d.custId === i.custid)
        ),
        i => iracing.getSeasonStandings(r.seasonid, r.carclassid, i.custid),
        { concurrency: 1 }
      ).then(stats => merged.concat(stats.map(s => ({ ...s.r[0], seasonid: r.seasonid, carclassid: r.carclassid })))),
      []
    );
    
    await channel.send(getNewsEmbed(results, stats, league));
  }));
  
  process.exit(0);
}