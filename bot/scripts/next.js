const Discord = require('discord.js');
const moment = require('moment');
const league = require('../../lib/league');
const { tracks } = require ('../../constants');
const { websiteChannelId, announcementChannelId } = require('../config.json');

const client = new Discord.Client();

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag} for scripts/next.`);
  
    await league.init();

    const race = await league.getNextRace();
    
    if (!race || race.offWeek /*|| !moment().isSame(race.date, 'day')*/) return client.destroy();
    
    //Slice content around the desired heading
    let startIndex = league.raceInfo.content.findIndex(
      item => item.nodeType === 'heading-3' && item.content[0].value.match(/^start times/i)
    );
    let endIndex = league.raceInfo.content.findIndex(
      (item, index) => index > startIndex && item.nodeType === 'heading-3'
    );

    const times = league.raceInfo.content.slice(startIndex + 1, endIndex);

    //Slice content around the desired heading
    startIndex = league.raceInfo.content.findIndex(
      item => item.nodeType === 'heading-3' && item.content[0].value.match(/^conditions/i)
    );
    endIndex = league.raceInfo.content.findIndex(
      (item, index) => index > startIndex && item.nodeType === 'heading-3'
    );

    const conditions = league.raceInfo.content.slice(startIndex + 1, endIndex);
    
    const embed = new Discord.MessageEmbed()
    	.setTitle('Tonight\'s Race')
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo-stacked.png')
      .addField(race.name, race.track)
      .addField('\u200b', times.reduce(
        (fields, { nodeType, content }) => {
          content = content
            .map(({ data, nodeType, value, content }) => {
              fields.push(`**${content[0].content[0].value}**${content[0].content[1].value}`)
            })
            .join('');
          return fields;
        }, 
        []
      ))
      .addField('\u200b', conditions.reduce(
        (fields, { nodeType, content }) => {
          content = content
            .map(({ data, nodeType, value, content }) => {
              fields.push(`**${content[0].content[0].value}**${content[0].content[1].value}`)
            })
            .join('');
          return fields;
        }, 
        []
      ))
      .setImage(
        tracks.find(({ name }) => race.track.indexOf(name) >= 0).logo
      )    	
      .setTimestamp();
            
    await client.channels.cache.get(websiteChannelId).send("@everyone", embed);
    
    client.destroy();

});

client.login(process.env.DISCORD_ACCESS_TOKEN);