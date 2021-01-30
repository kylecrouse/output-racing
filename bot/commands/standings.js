const league = require(`${process.cwd()}/lib/league`);
const { getStandingsEmbed } = require('../lib/embeds');

module.exports = {
	name: 'standings',
	description: 'Display standings for the current season',
  args: false,
	execute: async (message) => {
    
    await league.init();
          
    message.channel.send(getStandingsEmbed(league.season));

	},
};
