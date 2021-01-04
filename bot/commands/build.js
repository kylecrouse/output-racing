const { isAuthorized } = require('../lib/authorization');
const { buildAndDeploy } = require('../lib/builder');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'build',
	description: 'Build and deploy website (admin only).',
  args: false,
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
      
    try {
      await buildAndDeploy();
      message.react(REACTION_SUCCESS);
    }
    catch (err) {
      message.react(REACTION_FAILURE);
      message.reply(
        'Shit. Something broke.', 
        { embed: { description: `\`${err}\`` }}
      );
    }

	},
};
