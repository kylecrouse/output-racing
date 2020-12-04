const { handleAttachment } = require('../lib/attachments');
const league = require(`${process.cwd()}/lib/league`);

module.exports = {
	name: 'logo',
	description: 'Add logo to race results, either latest completed race for current season or most recent for specified track name.',
  args: true,
  usage: '<latest | track name>',
	execute: async (message, args) => handleAttachment(
    // Send cross-post if present, otherwise original message
    message.reference
      ? await message.channel.messages.fetch(message.reference.messageID)
      : message,
    // Save resolved asset to requested race results
    async (asset) => {
      // Ensure dependencies are initialized
      await league.init();

      // Update the matched race with new assets, once ready
      return league.addLogoToRace(
        // Resolve race to update from args
        (args[0] === 'latest')
          ? league.getLastRace()
          : league.getLastRace({ track: args[0] }), 
        // Wait for the asset uploads to resolve
        asset
      );
    }, 
    // Configure moderation message
    { description: `Can my screenshot be posted to the ${args[0]} race?`}
  ),
};