const Discord = require('discord.js');
const getStandings = require(`${process.cwd()}/lib/scraper/standings`);
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'standings',
	description: 'Import standings for a specific season from danlisa.com',
  args: true,
  usage: '<season id>',
	execute: async (message, args) => {
    try {
      const standings = await getStandings(args[0]);
      message.react(REACTION_SUCCESS);
    }
    catch(error) {
      console.log(error);
      message.react(REACTION_FAILURE);
    }
	},
};