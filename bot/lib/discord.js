const Discord = require('discord.js');
const { getSecretValue } = require('../../lib/secrets');

// const client = new discord.Client({ ws: { intents: discord.Intents.FLAGS.GUILD_MEMBERS }});
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

getSecretValue('ORLBot/Discord')
  .then(({ accessToken }) => client.login(accessToken))
  .catch((err) => { throw new Error(err); });

module.exports = client;