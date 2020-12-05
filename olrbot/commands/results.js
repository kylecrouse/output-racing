const importer = require(`${process.cwd()}/lib/scraper/results`);
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'results',
	description: 'Import a specific race result from danlisa.com',
  args: true,
  usage: '<race_id from danlisa.com>',
	execute: async (message, args) => {

    try {
      await importer(args[0]);
      message.react(REACTION_SUCCESS);
    }
    catch(error) {
      console.log(error);
      message.react(REACTION_FAILURE);
    }

	},
};