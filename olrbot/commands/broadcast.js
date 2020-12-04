const league = require(`${process.cwd()}/lib/league`);

module.exports = {
	name: 'broadcast',
	description: 'Set embedded YouTube link as broadcast of last race.',
  args: false,
	execute: async (message, args) => {
    
    // Handle embeds on message
    const embed = message.embeds.length > 0 && message.embeds
      .filter(({ video, url }) => video && url.match(/^https:\/\/www.youtube.com\//))
      .map(({ url }) => `https://www.youtube.com/embed/${url.match(/v=(\w+)&/)[1]}`)
      .shift();

    // Is nothing to save, exit
    if (!embed) return message.react('🤷‍♀️');

    // Ensure dependencies are initialized
    await league.init();
  
    // Update the last race with embed
    await league.addBroadcastToRace(league.getLastRace(), embed);

    message.react('👍');    
	},
};