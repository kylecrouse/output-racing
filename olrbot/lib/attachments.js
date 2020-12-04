const discord = require('discord.js');
const { isAuthorized } = require('../lib/authorization');
const { websiteChannelId } = require('../config.json');

const REACTION_ACCEPT = '👍';
const REACTION_DENY = '👎';
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
  handleAttachment: async (message, handler, embed = {}) => {
  
    // Get asset to be saved (only allow one per message)
    const asset = message.attachments && message.attachments.first();

    // Exit if nothing is attached.
    if (!asset) return message.react('🤷‍♀️');

    // If message is from an admin, approve it right away
    // Otherwise moderate the message and wait for response
    const approved = /*isAuthorized(message.author, message.channel) 
      || */await moderate(message, embed.description);
    
    if (approved) {
      
      // Run the handler and wait for response
      await handler(asset);

      // If approved is a message, then react successfully and send approval to original message.
      // Otherwise it's from an authorized user so respond successfully to message
      approved instanceof discord.Message 
        ? approved.react(REACTION_SUCCESS) && message.react(REACTION_ACCEPT)
        : message.react(REACTION_SUCCESS);
    }
    
    else message.react(DENY);
  
  }
}

async function moderate(message, description) {
  // Create a new embed from the message
  const embed = new discord.MessageEmbed()
  	.setAuthor(
      message.member ? message.member.displayName : message.author.username, 
      message.author.displayAvatarURL()
    )
  	.setDescription(description)
  	.setImage(message.attachments && message.attachments.first().url)
  	.setTimestamp()
    .setFooter(`${REACTION_ACCEPT} to approve or ${REACTION_DENY} to deny`);
  
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
  return approval.awaitReactions(filter, { max: 1 })
    .then(collected => collected.firstKey() === REACTION_ACCEPT ? approval : null)
    .catch(collected => approval.react(REACTION_FAILURE));
}