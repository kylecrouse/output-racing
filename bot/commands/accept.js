const Discord = require('discord.js');
const iracing = require(`${process.cwd()}/lib/iracing`);
const { getPending, accept } = require('../lib/applications');
const { isAuthorized } = require('../lib/authorization');
const { welcomeChannelId } = require('../config.json');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'accept',
	description: 'Accept driver application to league.',
  args: true,
  usage: '"<member name>" ["<reason>"]',
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
    
    try {      
      // Get applicant data
      const driver = await getPending(args[0]);
      
      // Return error message if didn't match driver name
      if (!driver) return message.reply(`No one named **${args[0]}** to invite.`);
      
      // Send invitation to iRacing league
      await iracing.inviteDriver(driver.custId, 2732);
      
      // Generate one-time invitation link to Discord #welcome channel
      const invite = await message.guild.channels.cache.get(welcomeChannelId).createInvite({
        unique: true,
        reason: driver.Name,
        maxUses: 1,
        maxAge: 604800
      });
      
      // Need to store this association in the spreadsheet and use it
      // when new members come online in the guild
      // (compare cached invite codes with available invite codes and 
      // see which one went missing, then grab that name to link
      // discord ID to an applicant and custID)
      
      // Accept driver in spreadsheet and save Discord invite code
      await accept(driver.Name, args[1], invite.code);
      
      // Send iRacing PM with info + discord invite
      await iracing.pmDriver(driver.custId, { 
        subject: 'Output Racing League',
        body: `Welcome to Output Racing League! Please accept your league invitation to join upcoming sessions, and join our Discord server ([url]${invite.url}[/url]) to complete your registration, get league information and chat with fellow drivers. Our website ([url]http://outputracing.com[/url]) is updated regularly with schedule, results and standings, in addition to being available on Discord. Please be sure to read and understand the rules ([url]http://outputracing.com/rules[/url]) thoroughly before joining your first session. If you have any questions or concerns, feel free to contact myself or one of our admins (Bryan Pizzichemi or Corey Steinhauser).`
      });
      
      message.react(REACTION_SUCCESS);
      
    }
    catch(err) {
      console.log(err);
      message.reply(
        `Shit. Something went wrong accepting **${args[0]}**.`, 
        { embed: { description: `\`${err}\`` }}
      );
    }

	},
};