const Discord = require('discord.js');
const league = require('../../lib/league');
const { announcementChannelId } = require('../config.json');
const { getUpcomingEmbed } = require('../lib/embeds');

const client = new Discord.Client();

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag} for scripts/next.`);
  
    await league.init();

    const race = league.getNextRace();
    
    if (!race || race.offWeek /*|| !moment().isSame(race.date, 'day')*/) 
      return client.destroy();
    
    await client.channels.cache.get(announcementChannelId).send("@everyone", getUpcomingEmbed(league));
    
    client.destroy();

});

client.login(process.env.DISCORD_ACCESS_TOKEN);