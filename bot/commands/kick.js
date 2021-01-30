const Discord = require('discord.js');
const league = require(`${process.cwd()}/lib/league`);
const iracing = require(`${process.cwd()}/lib/iracing`);
const { kick } = require('../lib/applications');
const { isAuthorized } = require('../lib/authorization');
const { buildAndDeploy } = require('../lib/builder');
const REACTION_ACCEPT = '👍';
const REACTION_DENY = '👎';
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'kick',
	description: 'Kick member from the league.',
  args: true,
  usage: '"<member name>" ["<reason>"]',
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
    
    try {      
      // Ensure data is loaded
      await league.init();
      
      // Resolve member name / arg[0] to a driver entry
      const driver = league.drivers.find(
        ({ name = '' }) => name.toLowerCase() === args[0].toLowerCase() 
      );
      if (!driver) return message.reply(`No one named **${args[0]}** to kick.`);
    
      // Set the collector filter for authorized users approving or denying
      const filter = (reaction, user) => {
        return isAuthorized(user, reaction.message.channel) 
          && (reaction.emoji.name === REACTION_ACCEPT || reaction.emoji.name === REACTION_DENY);
      };

      // Send a request for confirmation of this action
      const approval = await message.channel.send(`Are you *sure* you want to kick **${driver.name}**? ${REACTION_ACCEPT} or ${REACTION_DENY}`);
        
      // Wait for response and return decision as boolean
      const confirmation = await approval.awaitReactions(filter, { max: 1 })
        .then(collected => collected.firstKey() === REACTION_ACCEPT)
        .catch(collected => approval.react(REACTION_FAILURE));

      // If kicking wasn't confirmed, exit.
      if (!confirmation) return;
      
      // Get GuildMember based on linked discordId
      const member = message.guild.members.cache.get(driver.discordId);
      if (member) await member.kick(args[1]);
      
      // Remove from iRacing league
      // TODO: This leagueId should be fetched from League/CMS
      await iracing.removeDriver(driver.custId, 2732);
      
      // Mark driver as inactive
      await driver.put({ active: false });
      
      // Mark as kicked in spreadsheet
      await kick(driver.name, args[1]);
          
      // Rebuild website
      await buildAndDeploy();
      
      // Update cached data
      await league.load();
  
      message.reply(`**${args[0]}** is gone. Fuck that guy.`);
    }
    catch(err) {
      console.log(err);
      message.reply(
        `Shit. Something went wrong kicking **${args[0]}**.`, 
        { embed: { description: `\`${err}\`` }}
      );
    }

	},
};