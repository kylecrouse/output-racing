const getDrivers = require(`${process.cwd()}/lib/scraper/drivers`);
const getLatestResults = require(`${process.cwd()}/lib/scraper/latest`);
const getResults = require(`${process.cwd()}/lib/scraper/results`);
const getSeason = require(`${process.cwd()}/lib/scraper/season`);
const getStandings = require(`${process.cwd()}/lib/scraper/standings`);
const getStats = require(`${process.cwd()}/lib/scraper/stats`);
const league = require(`${process.cwd()}/lib/league`);
const cms = require(`${process.cwd()}/lib/contentful`);
const { isAuthorized } = require('../lib/authorization');
const { getResultsEmbed, getStandingsEmbed, getUpcomingEmbed, getIncidentsEmbed, getAttendanceEmbed } = require('../lib/embeds');
const { buildAndDeploy } = require('../lib/builder');
const { resultsChannelId, councilChannelId } = require('../config.json');
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'import',
	description: 'Import schedule, results, stats and standings from simracerhub.com',
  args: true,
  usage: '<drivers | latest | results | season | standings | stats> [<id>]',
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;

    // Ensure data is primed
    await league.init();
    
    try {
      let reply, embed, race;
      
      switch(args[0]) {
        case 'drivers':
          const created = await handleDrivers(2732);
          if (created.length > 0)
            reply = `Added ${created.join(', ')}.`;
        break;
        
        case 'latest':
          race = await handleLatest(args);
        break;
        
        case 'results':        
          embed = await getResultsEmbed(await handleResults(args));
        break;
        
        case 'season':
          await handleSeason(args[1] || league.season.id);
        break;
        
        case 'standings':
          await handleSeason(args[1] || league.season.id);
        break;
        
        case 'stats':
          await handleStats(args[1] || null);
        break;
        
        default: 
          message.react(REACTION_FAILURE);
          throw new Error(`I don\'t know how to do that. (${JSON.stringify(args)})`);
      }
      
      await league.load();
      
      await buildAndDeploy();
      
      // If is 'latest' import, update the results channel with the new data
      if (race && args[0] === 'latest') {
        // Get the results channel
        const channel = await message.client.channels.fetch(resultsChannelId);
        // Fetch and iterate messages in channel to remove previous bot messages
        await channel.messages.fetch({ limit: 5 }).then(
          // Delete messages from the bot
          messages => messages.size > 0 && 
            messages.filter(m => m.author.id === message.client.user.id)
              .map(m => m.delete())
        );
        // Send latest results
        channel.send(await getResultsEmbed(race));
        // Send season standings
        channel.send(getStandingsEmbed(league));
        // Send next race
        // NOTE: This was removed in favor of upcoming session, which won't be scheduled
        //       by this point. Consider reinstating, or using schedule command's embed.
        // channel.send(getUpcomingEmbed(league.season));
        
        // Get Drivers' Council channel
        const council = message.client.channels.cache.get(councilChannelId);
        // Send incident report
        council.send(getIncidentsEmbed(league.season, league.drivers));
        // Send attendance report
        council.send(getAttendanceEmbed(league.season, league.drivers));
      }
      
      if (reply && embed) message.reply(reply, embed);
      else if (reply) message.reply(reply);
      else if (embed) message.reply(embed);
          
      message.react(REACTION_SUCCESS);
      
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

  // Get the ID for the current season
  const seasonId = league.season.id;
  
  // Import the latest results from iRacing to simracerhub.com
  const race = await getLatestResults();

  // Update season data (schedule, standings, stats) from danlisa
  await getSeason(seasonId);
  
  // Update league stats
  await getStats('league', league.id);

  // Update driver stats
  // NOTE: This takes too long and people want results.
  // await getDrivers(2732);

  // Import the new results from danlisa
  return handleResults([
    null, 
    race.raceId, 
    args.length > 2 ? args[2] : race.name, 
    args.length > 3 ? args[3] : undefined
  ]);
}

function handleResults(args) {
  return getResults(args[1], null, {
    name: (args.length > 2) ? args[2] : undefined,
    broadcast: (args.length > 3) ? args[3] : undefined
  });
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
