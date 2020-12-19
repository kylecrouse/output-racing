const discord = require('discord.js');
const { isAuthorized } = require('../lib/authorization');
const { websiteChannelId } = require('../config.json');
const league = require(`${process.cwd()}/lib/league`);

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
    
    // If the author is authorized, assign it immediately
    if (isAuthorized(message.author, message.channel)) {
      await Promise.all(
        // Update iRacing
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
        ? await message.guild.channels.cache.get(websiteChannelId).send(embed)
        : await message.channel.send(embed);
        
      // Wait for response and return decision as boolean
      const approved = approval.awaitReactions(filter, { max: 1 })
        .then(collected => collected.firstKey() === REACTION_ACCEPT)
        .catch(collected => approval.react(REACTION_FAILURE));
      
      // If the number was approved, save it  
      if (approved) {
        await driver.put({ number: args[0] });
        message.react(REACTION_SUCCESS);        
      }
      
    }
  }
};