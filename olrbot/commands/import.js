const Discord = require('discord.js');
const { exec } = require('child_process');
const getDrivers = require(`${process.cwd()}/lib/scraper/drivers`);
const getLatestResults = require(`${process.cwd()}/lib/scraper/latest`);
const getResults = require(`${process.cwd()}/lib/scraper/results`);
const getSeason = require(`${process.cwd()}/lib/scraper/season`);
const getStandings = require(`${process.cwd()}/lib/scraper/standings`);
const getStats = require(`${process.cwd()}/lib/scraper/stats`);
const league = require(`${process.cwd()}/lib/league`);
const cms = require(`${process.cwd()}/lib/contentful`);
const { isAuthorized } = require('../lib/authorization');
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
        
      switch(args[0]) {
        case 'drivers':
          await handleDrivers(message, args);
        break;
        
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
      
      await exec('npm run build && aws s3 sync ./out s3://output-racing/ && aws cloudfront create-invalidation --distribution-id E2HCYIFSR21K3R');
          
    } catch(err) {
      console.log(err);
      message.reply(
        `Shit. Something went wrong importing **${args[0]}**.`, 
        { embed: { description: `\`${err}\`` }}
      );      
    }

	},
};

async function handleDrivers(message, args) {
  // Update all drivers from active roster
  // TODO: Store the leagueid in CMS and fetch from guild?
  const created = await getDrivers(2732);
  
  message.react(REACTION_SUCCESS);

  if (created.length > 0)
    message.reply(`Added ${created.join(', ')}.`)
}

async function handleLatest(message, args) {

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
  
  const results = race.results
    .sort((a,b) => a.finish - b.finish)
    .slice(0,5);

  const embed = new Discord.MessageEmbed()
  	.setTitle(race.name)
  	.setURL(`http://dnhi063vpnzuy.cloudfront.net/race/${args[1]}/`)
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