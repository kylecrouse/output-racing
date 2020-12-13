const league = require(`${process.cwd()}/lib/league`);

module.exports = {
	name: 'link',
	description: 'Link Discord ID to driver profile, or link the mentioned user.',
  args: true,
  usage: '<car number> [@<user>]',
	execute: async (message, args) => {

    // Ensure dependencies are initialized
    await league.init();

    // Find driver matching current car number
    const driver = await league.drivers.find(
      driver => driver.number === args[0]
    );
    
    if (!driver) return message.react('🤷‍♀️');

    // Set discordId for matched driver
    await driver.put({ 
      discordId: message.mentions.users.size > 0 
        ? message.mentions.users.first().id
        : message.author.id 
    });

    message.react('👍');

	},
};