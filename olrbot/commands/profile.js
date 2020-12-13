const { exec } = require('child_process');
const { handleAttachment } = require('../lib/attachments');
const league = require(`${process.cwd()}/lib/league`);

module.exports = {
	name: 'profile',
	description: 'Add attached image to your driver profile page.',
  args: false,
	execute: async (message) => handleAttachment(
    message,
    // Save resolved asset to requested race results
    async (asset) => {
      // Ensure dependencies are initialized
      await league.init();
      
      // Get the driver entry for the message author
      const driver = await league.drivers.find(
        driver => driver.discordId === message.author.id
      );
      
      // Get out of here if a driver wasn't matched.
      if (!driver) {
        message.reply("I don't know which driver profile is yours. Use `!link <car number>` and try again.");
        return;
      }
      
      // Publish changes
      await driver.put({ media: asset });
      
      // Rebuild and deploy website
      await exec('npm run build && aws s3 sync ./out s3://output-racing/');
    }, 
    // Configure moderation message
    { description: 'Can my new profile image be approved?'}
  ),
};