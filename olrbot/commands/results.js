const Discord = require('discord.js');
const moment = require('moment');
const league = require(`${process.cwd()}/lib/league`);
const cms = require(`${process.cwd()}/lib/contentful`);
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'results',
	description: 'Display results for latest race, or last at a specified track',
  args: false,
  usage: '[<track name>]',
	execute: async (message, args) => {
    
    await league.init();

    const race = await league.getLastRace(args.length > 0 ? { track: args[0] } : {});
    
    if (!race) return;
    
    const results = race.results.sort((a,b) => a.finish - b.finish);

    const embed = new Discord.MessageEmbed()
    	.setTitle(race.name)
    	.setURL(`http://dnhi063vpnzuy.cloudfront.net/race/${args[0]}/`)
      .addField(moment(race.date).format('dddd, MMMM Do YYYY'), `${race.track}\u000a${race.laps} laps (${race.cautions} cautions for ${race.cautionLaps} laps)`)
    	.addFields(
    		{ name: 'P', value: results.map(item => item.finish), inline: true },
    		{ name: 'Driver', value: results.map(item=> item.name), inline: true },
    		{ name: 'Interval', value: results.map(item=> item.interval), inline: true },
    	)
    	.setTimestamp()
      
    if (race.logo) {
      const logo = await cms.getAsset(race.logo.sys.id);
      embed.setThumbnail(`https:${logo.fields.file['en-US'].url}`);
    } else {
      embed.setThumbnail(
        tracks.find(({ name }) => race.track.indexOf(name) >= 0).logo
      );
    }
    
    if (race.media) {
      const media = await cms.getAsset(race.media[0].sys.id);
      embed.setImage(`https:${media.fields.file['en-US'].url}`);
    }
      
    // message.react(REACTION_SUCCESS);
      
    message.channel.send(embed);      

	},
};