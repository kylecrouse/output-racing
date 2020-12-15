const { spawn } = require('child_process');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'build',
	description: 'Build and deploy website (admin only).',
  args: false,
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
      
    console.log('Building and deploying website...');
    const build = spawn('npm run build && aws s3 sync ./out s3://output-racing/');
    
    build.on('close', (code) => {
      message.react(REACTION_SUCCESS);
    });
    
    build.on('error', (err) => {
      console.error(err);
      message.react(REACTION_FAILURE);
    });

	},
};
