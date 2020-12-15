const { spawn } = require('child_process');
const { isAuthorized } = require('../lib/authorization');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'build',
	description: 'Build and deploy website (admin only).',
  args: false,
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
      
    console.log('Building and deploying website...');
    const build = spawn('npm run build && aws s3 sync ./out s3://output-racing/ && aws cloudfront create-invalidation --distribution-id E2HCYIFSR21K3R', { shell: true });
    
    build.stdout.on('data', (data) => {
      console.log(`Build stdout: ${data}`);
    });
    
    build.on('exit', (code) => {
      console.log(`Build exited with code: ${code}`);
      message.react(REACTION_SUCCESS);
    });
    
    build.on('error', (err) => {
      console.error(err);
      message.react(REACTION_FAILURE);
    });

    build.on('close', (code) => {
      console.log(`Build closed with code: ${code}`);
    });
    
	},
};
