const Discord = require('discord.js');
const getLatestResults = require(`${process.cwd()}/lib/scraper/latest`);
const getResults = require(`${process.cwd()}/lib/scraper/results`);
const getSeason = require(`${process.cwd()}/lib/scraper/season`);
const getStandings = require(`${process.cwd()}/lib/scraper/standings`);
const getStats = require(`${process.cwd()}/lib/scraper/stats`);
const league = require(`${process.cwd()}/lib/league`);
const { isAuthorized } = require('../lib/authorization');
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'import',
	description: 'Import schedule, results, stats and standings from danlisa.com',
  args: true,
  usage: '<latest | results | season | standings | stats> <id>',
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
    
    switch(args[0]) {
      case 'latest':
        await handleLatest(message, args);
      break;
      
      case 'results':        
        await handleResults(message, args);
      break;
      
      case 'season':
        await handleSeason(message, args);
      break;
      
      case 'standings':
        await handleStandings(message, args);
      break;
      
      case 'stats':
        await handleStats(message, args);
      break;
      
      default: 
        message.react(REACTION_FAILURE);
        throw new Error(`I don\'t know how to do that. (${JSON.stringify(args)})`);
    }

	},
};

async function handleLatest(message, args) {

  // Ensure data is primed
  await league.init();
  
  // Get the ID for the current season
  const seasonId = league.season.fields.id['en-US'];
  
  // Import the latest results from iRacing to danlisa.com
  const race = await getLatestResults();

  await getSeason(seasonId);
  await getStandings(seasonId);
  await getStats('season', seasonId);
  await getStats('league', league.id);

  await handleResults(message, [
    null, 
    race.raceId, 
    args.length > 2 ? args[2] : race.name, 
    args.length > 3 ? args[3] : undefined
  ]);
}

async function handleResults(message, args) {
  const race = await getResults(args[1], {
    name: (args.length > 2) ? args[2] : undefined,
    broadcast: (args.length > 3) ? args[3] : undefined
  });
  
  const results = race.fields.results['en-US']
    .sort((a,b) => a.finish - b.finish)
    .slice(0,5);

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
}

async function handleSeason(message, args) {
  await getSeason(args[1]);
  message.react(REACTION_SUCCESS);
}

async function handleStandings(message, args) {
  await getStandings(args[1]);
  message.react(REACTION_SUCCESS);
}

async function handleStats(message, args) {
  if (args.length >= 2)
    await getStats('season', args[1])
  else 
    await getStats('league', 1710);
  
  message.react(REACTION_SUCCESS);
}