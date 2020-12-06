const Discord = require('discord.js');
const getResults = require(`${process.cwd()}/lib/scraper/results`);
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'results',
	description: 'Import a specific race result from danlisa.com, optionally providing event name, broadcast URL from YouTube and attaching screenshot image',
  args: true,
  usage: '<race_id from danlisa.com> "<event name>" <broadcast url>',
	execute: async (message, args) => {

    try {
      let overrides = {};
      if args[1] overrides.name = args[1];
      if args[2] overrides.broadcast = args[2];
      
      const race = await getResults(args[0], overrides);
      
      const results = race.fields.results['en-US'].sort((a,b) => a.finish - b.finish).slice(0,5);
  
      const embed = new Discord.MessageEmbed()
      	.setTitle(race.fields.name['en-US'])
      	.setURL(`http://dnhi063vpnzuy.cloudfront.net/race/${args[0]}/`)
      	.setThumbnail(tracks.find(({ name }) => race.fields.track['en-US'].indexOf(name) >= 0).logo)
      	.addFields(
      		{ name: 'Pos.', value: results.map(item => item.finish).join('\u000a'), inline: true },
      		{ name: 'Driver', value: results.map(item=> item.name).join('\u000a'), inline: true },
      		{ name: 'Interval', value: results.map(item=> item.interval).join('\u000a'), inline: true },
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