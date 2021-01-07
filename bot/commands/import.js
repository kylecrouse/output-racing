const Discord = require('discord.js');
const getDrivers = require(`${process.cwd()}/lib/scraper/drivers`);
const getLatestResults = require(`${process.cwd()}/lib/scraper/latest`);
const getResults = require(`${process.cwd()}/lib/scraper/results`);
const getSeason = require(`${process.cwd()}/lib/scraper/season`);
const getStandings = require(`${process.cwd()}/lib/scraper/standings`);
const getStats = require(`${process.cwd()}/lib/scraper/stats`);
const league = require(`${process.cwd()}/lib/league`);
const cms = require(`${process.cwd()}/lib/contentful`);
const { isAuthorized } = require('../lib/authorization');
const { buildAndDeploy } = require('../lib/builder');
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'import',
	description: 'Import schedule, results, stats and standings from danlisa.com',
  args: true,
  usage: '<drivers | latest | results | season | standings | stats> [<id>]',
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
    
    try {
      let reply, embed;
      
      switch(args[0]) {
        case 'drivers':
          const created = await handleDrivers(2732);
          if (created.length > 0)
            reply = `Added ${created.join(', ')}.`;
        break;
        
        case 'latest':
          embed = await handleLatest(args);
        break;
        
        case 'results':        
          embed = await handleResults(args);
        break;
        
        case 'season':
          await handleSeason(args);
        break;
        
        case 'standings':
          await handleStandings(args);
        break;
        
        case 'stats':
          await handleStats(args);
        break;
        
        default: 
          message.react(REACTION_FAILURE);
          throw new Error(`I don\'t know how to do that. (${JSON.stringify(args)})`);
      }
      
      await buildAndDeploy();
      
      message.react(REACTION_SUCCESS);
      
      if (reply && embed) message.reply(reply, embed);
      else if (reply) message.reply(reply);
      else if (embed) message.reply(embed);
          
    } catch(err) {
      console.log(err);
      message.reply(
        `Shit. Something went wrong importing **${args[0]}**.`, 
        { embed: { description: `\`${err}\`` }}
      );      
    }

	},
};

function handleDrivers(leagueId) {
  // Update all drivers from active roster
  // TODO: Store the leagueid in CMS and fetch from guild?
  return getDrivers(leagueId);
}

async function handleLatest(args) {

  // Ensure data is primed
  await league.init();
  
  // Get the ID for the current season
  const seasonId = league.season.id;
  
  // Import the latest results from iRacing to danlisa.com
  const race = await getLatestResults();

  // Update season data (schedule, standings, stats) from danlisa
  await getSeason(seasonId);
  
  // Update league stats
  await getStats('league', league.id);

  // Import the new results from danlisa
  return handleResults([
    null, 
    race.raceId, 
    args.length > 2 ? args[2] : race.name, 
    args.length > 3 ? args[3] : undefined
  ]);
}

async function handleResults(args) {
  const race = await getResults(args[1], {
    name: (args.length > 2) ? args[2] : undefined,
    broadcast: (args.length > 3) ? args[3] : undefined
  });
  
  const results = race.results
    .sort((a,b) => a.finish - b.finish)
    .slice(0,5);

  const embed = new Discord.MessageEmbed()
  	.setTitle(race.name)
  	.setURL(`https://outputracing.com/race/${args[1]}/`)
  	.addFields(
  		{ name: 'P', value: results.map(item => `\`${item.finish}\``), inline: true },
  		{ name: 'Driver', value: results.map(item=> `\`${item.name}\``), inline: true },
  		{ name: 'Interval', value: results.map(item=> `\`${item.interval}\``), inline: true },
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

  return embed;  
}

function handleSeason(seasonId) {
  return getSeason(seasonId);
}

function handleStandings(seasonId) {
  return getStandings(seasonId);
}

function handleStats(seasonId) {
  if (seasonId)
    return getStats('season', seasonId)
  else 
    return getStats('league', 1710);
}
