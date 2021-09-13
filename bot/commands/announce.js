const league = require(`${process.cwd()}/lib/league`);
const { isAuthorized } = require('../lib/authorization');
const { announceResults } = require('../lib/announcements');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'announce',
	description: 'Trigger various announcements',
	args: true,
	usage: '<latest>',
	execute: async (message, args) => {
		
		if (!isAuthorized(message.author, message.channel)) return;

		// Ensure data is primed
		await league.init();
		
		if (args[0] === 'latest') {
			// Get the most recent race
			const race = await league.getLastRace();
			
			// Send post-race announcements 
			await announceResults(message, league, race);
			
			message.react(REACTION_SUCCESS);
		}


	},
};
