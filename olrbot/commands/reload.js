const league = require(`${process.cwd()}/lib/league`);
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'reload',
	description: 'Reload league data from CMS (admin only).',
  args: false,
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
      
    try {
      await league.load();
      message.react(REACTION_SUCCESS);
    }
    catch(error) {
      console.error(err);
      message.react(REACTION_FAILURE);
    }

	},
};
