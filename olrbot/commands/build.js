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

    const build = spawn('npm', ['run', 'build']);
    
    build.stdout.on('data', (data) => {
      console.log(`Build stdout: ${data}`);
    });
    
    build.on('exit', (code) => {
      console.log(`Build exited with code: ${code}`);
      
      const sync = spawn(
        'aws', 
        ['s3', 'sync', './out', 's3://output-racing/']
      );
      
      sync.stdout.on('data', (data) => {
        console.log(`Sync stdout: ${data}`);
      });
      
      sync.on('exit', (code) => {
        console.log(`Sync exited with code: ${code}`);
        
        const invalidate = spawn(
          'aws', 
          ['cloudfront', 'create-invalidation', '--distribution-id', 'E2HCYIFSR21K3R']
        );

        invalidate.stdout.on('data', (data) => {
          console.log(`Invalidate stdout: ${data}`);
        });
        
        sync.on('exit', (code) => {
          console.log(`Invalidate exited with code: ${code}`);
          message.react(REACTION_SUCCESS);
        });
        
        invalidate.on('error', (err) => {
          console.error(err);
          message.react(REACTION_FAILURE);
        });
    
        invalidate.on('close', (code) => {
          console.log(`Invalidate closed with code: ${code}`);
        });

      });

      sync.on('error', (err) => {
        console.error(err);
        message.react(REACTION_FAILURE);
      });
  
      sync.on('close', (code) => {
        console.log(`Sync closed with code: ${code}`);
      });
      
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
