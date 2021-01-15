const discord = require('discord.js');
const { isAuthorized } = require('../lib/authorization');
const { websiteChannelId } = require('../config.json');
const league = require(`${process.cwd()}/lib/league`);
const iracing = require(`${process.cwd()}/lib/iracing`);

const REACTION_ACCEPT = '👍';
const REACTION_DENY = '👎';
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'number',
	description: 'Request a car number, or assign a car number to specified driver.',
  args: true,
  usage: '<number> [@<name>]',
	execute: async (message, args) => {
    
    // Exit if trying to assign without authorization
    if (message.mentions.size > 0 && !isAuthorized(message.author, message.channel))
      return;
      
    // Ensure dependencies are initialized
    await league.init();
    
    // Get the driver entry for the mentioned user or author
    const driver = await league.drivers.find(
      message.mentions.size > 0
        ? driver => driver.discordId === message.mentions.firstKey()
        : driver => driver.discordId === message.author.id
    );
    
    // If no driver matched, bail out.
    if (!driver) return;
    
    // Check whether number is already in use
    const assigned = await league.drivers.find(driver => driver.active && driver.number === args[0]);
    
    // If number is assigned already, exit with reply.
    if (assigned) return message.reply(`That number is already assigned. Try again.`);
    
    // Validate a 2-digit number not starting with 0
    if (!args[0].match(/^[1-9][0-9]$/)) return message.reply('Numbers must be between 1–99 and may not start with 0. Try again');
    
    // If the author is authorized, assign it immediately
    if (isAuthorized(message.author, message.channel)) {
      await Promise.all(
        // Update iRacing
        iracing.updateDriver('CarNumber', args[0], driver.custId, 2732),
        // Update driver record
        driver.put({ number: args[0] })
      );
      message.react(REACTION_SUCCESS);
    }
    
    // Otherwise send it for moderation
    else {
      
      // Set the collector filter for authorized users approving or denying
      const filter = (reaction, user) => {
        return isAuthorized(user, reaction.message.channel) 
          && (reaction.emoji.name === REACTION_ACCEPT || reaction.emoji.name === REACTION_DENY);
      };
      
      // Send the message to the appropriate location
      const approval = message.guild
        ? await message.guild.channels.cache.get(websiteChannelId).send(`@Admin ${message.member.displayName} wants to use **#${args[0]}**. ${REACTION_ACCEPT} to approve, ${REACTION_DENY} to deny.`)
        : await message.channel.send(`@Admin ${message.author.username} wants to use **#${args[0]}**. React with ${REACTION_ACCEPT} to approve or ${REACTION_DENY} to deny.`);
        
      // Wait for response and return decision as boolean
      const approved = approval.awaitReactions(filter, { max: 1 })
        .then(collected => collected.firstKey() === REACTION_ACCEPT)
        .catch(collected => approval.react(REACTION_FAILURE));
      
      // If the number was approved, save it  
      if (approved) {
        await Promise.all(
          // Update iRacing
          iracing.updateDriver('CarNumber', args[0], driver.custId, 2732),
          // Update driver record
          driver.put({ number: args[0] })
        );
        message.react(REACTION_SUCCESS);        
      }
      
    }
  }
};