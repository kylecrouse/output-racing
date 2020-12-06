const Discord = require('discord.js');
const getResults = require(`${process.cwd()}/lib/scraper/results`);
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'results',
	description: 'Import a specific race result from danlisa.com',
  args: true,
  usage: '<race_id from danlisa.com>',
	execute: async (message, args) => {

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
    	.setURL(`http://dnhi063vpnzuy.cloudfront.net/race/${args[0]}/`)
    	.setThumbnail(tracks.find(({ name }) => race.fields.track['en-US'].indexOf(name) >= 0).logo)
    	.addFields(
    		{ name: 'F', value: finish, inline: true },
    		{ name: 'S', value: start, inline: true },
    		{ name: 'Driver', value: driver, inline: true },
    		{ name: 'Interval', value: interval, inline: true },
    		{ name: 'Laps Led', value: led, inline: true },
    		{ name: 'Incidents', value: incidents, inline: true },
    	)
    	.setTimestamp()
      
    message.channel.send(embed);

	},
};