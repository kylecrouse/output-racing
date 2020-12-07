const Discord = require('discord.js');
const getResults = require(`${process.cwd()}/lib/scraper/results`);
const getSeason = require(`${process.cwd()}/lib/scraper/season`);
const getStandings = require(`${process.cwd()}/lib/scraper/standings`);
const getStats = require(`${process.cwd()}/lib/scraper/stats`);
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'import',
	description: 'Import schedule, results, stats and standings from danlisa.com',
  args: true,
  usage: '<results | season | standings | stats> <id>',
	execute: async (message, args) => {    
    switch(args[0]) {
      case 'results':        
        const race = await getResults(args[1], {
          name: (args.length > 2) ? args[2] : undefined,
          broadcast: (args.length > 3) ? args[3] : undefined
        });
        
        const results = race.fields.results['en-US'].sort((a,b) => a.finish - b.finish).slice(0,5);
    
        const embed = new Discord.MessageEmbed()
        	.setTitle(race.fields.name['en-US'])
        	.setURL(`http://dnhi063vpnzuy.cloudfront.net/race/${args[1]}/`)
        	.setThumbnail(tracks.find(({ name }) => race.fields.track['en-US'].indexOf(name) >= 0).logo)
        	.addFields(
        		{ name: 'P', value: results.map(item => item.finish).join('\u000a'), inline: true },
        		{ name: 'Driver', value: results.map(item=> item.name).join('\u000a'), inline: true },
        		{ name: 'Interval', value: results.map(item=> item.interval).join('\u000a'), inline: true },
        	)
        	.setTimestamp()
          
        message.react(REACTION_SUCCESS);
        message.channel.send(embed);  
      break;
      
      case 'season':
        await getSeason(args[1]);
        message.react(REACTION_SUCCESS);
      break;
      
      case 'standings':
        await getStandings(args[1]);
        message.react(REACTION_SUCCESS);
      break;
      
      case 'stats':
        args.length >= 2 ? await getStats('season', args[1]) : await getStats('league', 1710);
        message.react(REACTION_SUCCESS);
      break;
      
      default: 
        throw new Error(`I don\'t know how to do that. (${JSON.stringify(args)})`);
    }

	},
};