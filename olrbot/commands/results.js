const Discord = require('discord.js');
const getResults = require(`${process.cwd()}/lib/scraper/results`);
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'results',
	description: 'Import a specific race result from danlisa.com, optionally providing event name, broadcast URL from YouTube and attaching screenshot image',
  args: true,
  usage: '<race_id from danlisa.com> <event name> <broadcast url>',
	execute: async (message, args) => {

    try {
      const race = await getResults(args[0]);
      
      const results = race.fields.results['en-US'].sort((a,b) => a.finish - b.finish).slice(0,5);
      let finish = results.map(item => item.finish).join('\u000a');
      let start = results.map(item=> item.start).join('\u000a');
      let driver = results.map(item=> item.name).join('\u000a');
      let interval = results.map(item=> item.interval).join('\u000a');
      let led = results.map(item=> item.led).join('\u000a');
      let incidents = results.map(item=> item.incidents).join('\u000a');
  
      const embed = new Discord.MessageEmbed()
      	.setTitle(race.fields.name['en-US'])
        .setDescription('Race Results')
      	.setURL(`http://dnhi063vpnzuy.cloudfront.net/race/${args[0]}/`)
      	.setThumbnail(tracks.find(({ name }) => race.fields.track['en-US'].indexOf(name) >= 0).logo)
      	.addFields(
      		{ name: '\u200b', value: driver, inline: true },
      		{ name: 'Int', value: interval, inline: true },
      		{ name: 'Led', value: led, inline: true },
      		{ name: 'Inc', value: incidents, inline: true },
      	)
      	.setTimestamp()
        
      message.react(REACTION_SUCCESS);
        
      message.channel.send(embed);      
    }
    catch(error) {
      console.log(error);
      message.react(REACTION_FAILURE);
    }

	},
};