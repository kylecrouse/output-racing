const { spawn } = require('child_process');

async function buildAndDeploy() {
  return new Promise((resolve, reject) => {
      
    console.log('Building and deploying website...');

    const build = spawn('npm', ['run', 'build']);
    
    build.stdout.on('data', (data) => {
      console.log(`Build stdout: ${data}`);
    });
    
    build.stderr.on('data', (data) => {
      console.error(`Build stderr: ${data}`);
    });
    
    build.on('exit', (code) => {
      console.log(`Build exited with code: ${code}`);
      
      if (code == 1) 
        return reject(new Error(`Build failed with code ${code}.`));
      
      const sync = spawn(
        'aws', 
        ['s3', 'sync', './out', 's3://output-racing/']
      );
      
      sync.stdout.on('data', (data) => {
        console.log(`Sync stdout: ${data}`);
      });
      
      sync.stderr.on('data', (data) => {
        console.error(`Sync stderr: ${data}`);
      });
      
      sync.on('exit', (code) => {
        console.log(`Sync exited with code: ${code}`);
        
        if (code == 255) 
          return reject(new Error(`Sync failed with code ${code}.`));
        
        const invalidate = spawn(
          'aws', 
          ['cloudfront', 'create-invalidation', '--distribution-id', 'E2HCYIFSR21K3R', '--paths', '"/*"']
        );

        invalidate.stdout.on('data', (data) => {
          console.log(`Invalidate stdout: ${data}`);
        });
        
        invalidate.stderr.on('data', (data) => {
          console.error(`Invalidate stderr: ${data}`);
        });
        
        invalidate.on('exit', (code) => {
          console.log(`Invalidate exited with code: ${code}`);
          
          if (code == 255) 
            return reject(new Error(`Invalidation failed with code ${code}.`));
          else
            resolve();
        });
        
      });

    });
    
  });
}

// Allow this script to be run from the command line or as a module
if (process.argv[1] === `${process.cwd()}/olrbot/lib/builder.js`) {
  return buildAndDeploy();
} else {
  module.exports = { buildAndDeploy };
}
