const Discord = require('discord.js');
const moment = require('moment');
const league = require(`${process.cwd()}/lib/league`);
const { tracks } = require ('../../constants');
const { getUpcomingEmbed } = require('../lib/embeds');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'next',
	description: 'Display info for next scheduled race',
  args: false,
	execute: async (message, args) => {
    
    await league.init();

    if (!league.getNextRace()) 
      return message.react(REACTION_FAILURE);
    
    message.channel.send(getUpcomingEmbed(league));      

	},
};