const league = require(`${process.cwd()}/lib/league`);
const { isAuthorized } = require('../lib/authorization');
const { getAttendanceEmbed } = require('../lib/embeds');

module.exports = {
	name: 'starts',
	description: 'Get attendance report for the current or specified season.',
  args: false,
  usage: '[@<season>]',
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
    
    await league.init();
    
    const season = args[0] 
      ? league.seasons.find(({ id }) => id == args[0])
      : league.season;
      
    if (!season) return message.reply("couldn't find season.");
    
    if (season.stats.length <= 0) return message.reply("there are no stats for that season.");
      
    message.channel.send(getAttendanceEmbed(season));

	},
};
