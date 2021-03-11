const league = require(`${process.cwd()}/lib/league`);
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'broadcast',
	description: 'Set embedded YouTube link as broadcast of last race.',
  args: false,
	execute: async (message, args) => {
    
    const source = message.reference
      ? await message.channel.messages.fetch(message.reference.messageID)
      : message;

    if (source.embeds.size <= 0) return message.react('🤷‍♀️');
    
    // Handle embeds on message
    const [broadcast] = source.embeds
      .filter(({ video, url }) => video && url.match(/^https:\/\/www.youtube.com\//))
      .map(({ url }) => `https://www.youtube.com/embed/${url.match(/v=(\w+)&/)[1]}`);

    // Is nothing to save, exit
    if (!broadcast) return message.react('🤷‍♀️');

    try {
      // Ensure dependencies are initialized
      await league.init();

      // Update the last race with embed
      const race = await league.getLastRace();
      await race.put({ broadcast });

      message.react(REACTION_SUCCESS);
    }
    catch(error) {
      console.error(error);
      message.react(REACTION_FAILURE);
    }
	},
};