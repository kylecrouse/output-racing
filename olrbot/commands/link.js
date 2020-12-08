const league = require(`${process.cwd()}/lib/league`);

module.exports = {
	name: 'link',
	description: 'Link your Discord ID to your driver profile',
  args: true,
  usage: '<car number>',
	execute: async (message, args) => {

    // Ensure dependencies are initialized
    await league.init();

    // Find driver matching current car number
    const driver = await league.findDriver(
      { field: 'number', value: args[0] }
    );
    
    if (!driver) return message.react('🤷‍♀️');

    // Set discordId for matched driver
    await league.updateDriver(driver, { discordId: message.author.id });

    message.react('👍');

	},
};