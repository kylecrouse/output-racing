const client = require('../lib/discord');
const league = require('../../lib/league');

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
  
  await channel.send('I did it right!');
}