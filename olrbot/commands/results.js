const importer = require(`${process.cwd()}/lib/scraper/results`);

module.exports = {
	name: 'results',
	description: 'Import a specific race result from danlisa.com',
  args: true,
  usage: '<race_id from danlisa.com>',
	execute: async (message, args) => {

    message.reply(await importer(args[0]));

	},
};