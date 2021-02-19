const { isAuthorized, isCouncil } = require('../lib/authorization');
const league = require(`${process.cwd()}/lib/league`);

const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'nickname',
	description: 'Update your Discord nickname to match league specs, or for a specific user.',
  args: false,
  usage: '[@<name>]',
	execute: async (message, args) => {
    // console.log(message);
    
    // Exit if trying to assign without authorization
    if (message.mentions.users.size > 0 && !isAuthorized(message.author, message.channel))
      return;
      
    if (!message.guild || !message.guild.me.hasPermission('MANAGE_NICKNAMES'))
      return message.reply(`I don't have permission at the moment. Please change it yourself to \`#number name\`, like **#26 Ricky Botty**.`);
      
    // Ensure dependencies are initialized
    await league.init();
    
    // Get the driver entry for the mentioned user or author
    const driver = league.drivers.find(
      message.mentions.size > 0
        ? driver => driver.discordId == message.mentions.firstKey()
        : driver => driver.discordId == message.author.id
    );
    
    // If no driver matched, bail out.
    if (!driver) return message.react(REACTION_FAILURE);
    
    // Update guild nickname to number + name.
    if (message.mentions.users.size > 0) {
      const guild = message.client.guilds.cache.get('');
      const member = guild.members.cache.get(message.mentions.firstKey());
      if (member) {
        await member.setNickname(`#${driver.number} ${driver.nickname || driver.name} crasher`, 'League guidelines');  
        message.react(REACTION_SUCCESS);
      } else {
        message.react(REACTION_FAILURE);
      }
    }
    else if (message.member) {
      await message.member.setNickname(`#${driver.number} ${driver.nickname || driver.name} ya fool`, 'League guidelines');
      message.react(REACTION_SUCCESS);
    } else {
      message.react(REACTION_FAILURE);
    }
      
  }
};