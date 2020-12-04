const cms = require(`${process.cwd()}/lib/contentful`);

module.exports = {
	name: 'link',
	description: 'Link your Discord ID to your driver profile',
  args: true,
  usage: '<car number>',
	execute: async (message, args) => {

    // Ensure dependencies are initialized
    await cms.init();

    // Find driver matching current car number
    const [driver] = await cms.get({ content_type: 'driver', 'fields.number': args[0] });
    
    if (!driver) return message.react('🤷‍♀️');

    // Set discordId for matched driver
    driver.fields.discordId = { 'en-US': message.author.id };
    
    // Publish changes
    await cms.update(driver);

    message.react('👍');

	},
};