const getStats = require(`${process.cwd()}/lib/scraper/stats`);
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'stats',
	description: 'Import a stats for league career or a specific season from danlisa.com',
  args: true,
  usage: '<season | league> <season id>',
	execute: async (message, args) => {
    try {
      // TODO: Convert the leagueID to a non-static value if planning to extend
      const stats = await getStats(args[0], args.length > 1 ? args[1] : 1710);      
      message.react(REACTION_SUCCESS);
    }
    catch(error) {
      console.log(error);
      message.react(REACTION_FAILURE);
    }
	},
};