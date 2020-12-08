const Discord = require('discord.js');
const league = require(`${process.cwd()}/lib/league`);
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
    
    const results = race.fields.results['en-US'].sort((a,b) => a.finish - b.finish);

    const embed = new Discord.MessageEmbed()
    	.setTitle(race.fields.name['en-US'])
    	.setURL(`http://dnhi063vpnzuy.cloudfront.net/race/${args[0]}/`)
    	.setThumbnail(tracks.find(({ name }) => race.fields.track['en-US'].indexOf(name) >= 0).logo)
    	.addFields(
    		{ name: 'P', value: results.map(item => item.finish).join('\u000a'), inline: true },
    		{ name: 'Driver', value: results.map(item=> item.name).join('\u000a'), inline: true },
    		{ name: 'Interval', value: results.map(item=> item.interval).join('\u000a'), inline: true },
    	)
    	.setTimestamp()
      
    message.react(REACTION_SUCCESS);
      
    message.channel.send(embed);      

	},
};