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

    const embed = new Discord.MessageEmbed()
    	.setTitle(race.fields.name['en-US'])
    	.setURL(`http://dnhi063vpnzuy.cloudfront.net/race/${args[0]}/`)
    	.setThumbnail(tracks.find(({ name }) => race.fields.track['en-US'].indexOf(name) >= 0).logo)
    	.addFields(
    		{ name: 'F', value: 'Some value here', inline: true },
    		{ name: 'S', value: 'Some value here', inline: true },
    		{ name: 'Driver', value: 'Some value here', inline: true },
    		{ name: 'Interval', value: 'Some value here', inline: true },
    		{ name: 'Laps Led', value: 'Some value here', inline: true },
    		{ name: 'Incidents', value: 'Some value here', inline: true },
    	)
    	.setTimestamp()
      
    message.channel.send(embed);

	},
};