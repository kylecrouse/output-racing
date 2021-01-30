const moment = require('moment');
const league = require(`${process.cwd()}/lib/league`);
const cms = require(`${process.cwd()}/lib/contentful`);
const { getResultsEmbed } = require('../lib/embeds');
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'results',
	description: 'Display results for latest race, or last at a specified track',
  args: false,
  usage: '[<track name>]',
	execute: async (message, args) => {
    
    await league.init();

    const race = league.getLastRace(args.length > 0 ? { track: args[0] } : {});
    
    if (!race) 
      return message.react(REACTION_FAILURE);
    
    // message.react(REACTION_SUCCESS);
      
    message.channel.send(await getResultsEmbed(race));      

	},
};
