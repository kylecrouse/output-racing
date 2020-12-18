const Discord = require('discord.js');
const { exec } = require('child_process');
const league = require(`${process.cwd()}/lib/league`);
const iracing = require(`${process.cwd()}/lib/iracing`);
const { kick } = require('../lib/applications');
const { isAuthorized } = require('../lib/authorization');

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
        ({ name = '', nickname = '' }) => name.toLowerCase() === args[0].toLowerCase() 
          || nickname.toLowerCase() === args[0].toLowerCase()
      );
      if (!driver) return message.reply(`No one named **${args[0]}** to kick.`);
      
      // Get GuildMember based on linked discordId
      const member = message.guild.members.cache.get(driver.discordId);
      if (member) await member.kick(args[1]);
      
      // Remove from iRacing league
      // TODO: This leagueId should be fetched from League/CMS
      await iracing.removeDriver(driver.custId, 2732);
      
      // Mark driver as inactive
      await driver.put({ active: false });
      
      // Mark as kicked in spreadsheet
      await kick(args[0], args[1]);
          
      // Rebuild website to update driver roster
      await exec('npm run build && aws s3 sync ./out s3://output-racing/ && aws cloudfront create-invalidation --distribution-id E2HCYIFSR21K3R');
  
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