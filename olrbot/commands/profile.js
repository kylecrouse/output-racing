const { handleAttachment } = require('../lib/attachments');
const cms = require(`${process.cwd()}/lib/contentful`);

module.exports = {
	name: 'profile',
	description: 'Add attached image to your driver profile page.',
  args: false,
	execute: async (message) => handleAttachment(
    message,
    // Save resolved asset to requested race results
    async (asset) => {
      // Ensure dependencies are initialized
      await cms.init();
      
      // Get the driver entry for the message author
      const [driver] = await cms.get({ content_type: 'driver', 'fields.discordId': message.author.id });
      
      // Get out of here if a driver wasn't matched.
      if (!driver) return;
      
      // // Save the attachments to the entry
      driver.fields.media = { 'en-US': (driver.fields.media)
        ? driver.fields.media['en-US'].concat(await cms.createAsset(asset))
        : [await cms.createAsset(asset)]
      };
      
      // Publish changes
      return cms.update(driver);
    }, 
    // Configure moderation message
    { description: 'Can my new profile image be approved?'}
  ),
};