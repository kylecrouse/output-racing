const Discord = require('discord.js');
const moment = require('moment');
const league = require(`${process.cwd()}/lib/league`);
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'next',
	description: 'Display info for next scheduled race',
  args: false,
	execute: async (message, args) => {
    
    await league.init();

    const race = await league.getNextRace();
    
    if (!race) return;
    
    const embed = new Discord.MessageEmbed()
    	.setTitle('Up Next')
      .addField(race.name, `${moment(race.date).format('dddd, MMMM Do YYYY')}\u000a${race.track}\u000a${race.distance}`)
      .setImage(
        tracks.find(({ name }) => race.track.indexOf(name) >= 0).logo
      )    	
      .setTimestamp();
      
    message.channel.send(embed);      

	},
};