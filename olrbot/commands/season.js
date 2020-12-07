const getSeason = require(`${process.cwd()}/lib/scraper/season`);
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'season',
	description: 'Import schedule, results, stats and standings for a specific season from danlisa.com',
  args: true,
  usage: '<season id>',
	execute: async (message, args) => {
    try {
      const season = await getSeason(args[0]);
      message.react(REACTION_SUCCESS);
    }
    catch(error) {
      console.log(error);
      message.react(REACTION_FAILURE);
    }
	},
};