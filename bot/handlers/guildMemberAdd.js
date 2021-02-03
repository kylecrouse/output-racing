const _ = require('lodash');
const Discord = require('discord.js');
const moment = require('moment');
const league = require(`${process.cwd()}/lib/league`);
const iracing = require(`${process.cwd()}/lib/iracing`);
const { generalChannelId } = require('../config.json');
const { getInvited, setAccepted } = require('../lib/applications');
const { isAuthorized } = require('../lib/authorization');

const REACTION_ACCEPT = '👍';
const REACTION_DENY = '👎';
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = async (member) => {
  // Send "welcome to league" DM and introduce bot
  const channel = await member.createDM();
  channel.send(`Welcome to Output Racing League!`);
  channel.send(`I'm ${member.client.user.username} and I help Jaren out with league stuff so he can focus on winning.`);
  
  // Get inviteCodes from applicants
  const applicants = await getInvited();
  
  // Get open invites from guild
  const invites = await member.guild.fetchInvites();
  
  // Find the missing applicant code from guild
  const [applicant] = _.intersectionWith(applicants, invites, 
    (applicant, invite) => applicant.inviteCode == invite.code
  );
  
  // If nothing is found, send commands message and exit.
  if (!applicant) 
    return channel.send(`Check out \`!help\` for things to do, like get the current league standings with \`!standings\` or the latest race results with \`!results latest\`. Have fun!`);

  // Confirm with driver that we matched them correctly?
  channel.send(`First, can you confirm that you are **${applicant.Name}**?`);

  // Wait for messages, filtered by matching positive or negative
  // return boolean to indicate response
  const confirmed = await channel.awaitMessages(
    msg => !msg.author.bot && msg.content.match(/yes|y|sure|ok|yeah|correct|no|nope|n|nah|negative|wrong/i),
    { max: 1 }
  ).then(
    collected => {
     const msg = collected.first();
     return !!msg.content.match(/yes|y|sure|ok|yeah|correct/i);
    }
  );

  if (!confirmed) 
    return channel.send(`Oops. Can you let **@kylecrouse** know I screwed up?`);
  
  // Update the applications to reflect acceptance
  await setAccepted(applicant.Name);
  
  channel.send('Great! Give me a minute to gather up all your stats from iRacing.');
  
  // Ensure data is loaded
  await league.init();
  
  // Create or update driver entry with discordId
  let driver = await league.mapDriver(applicant.Name);
  
  // Get license and stats from iRacing
  // TODO: This should be common, like scrapers/driver
  const { license, stats, memberSince } = await iracing.getCareerStats(applicant.custId);

  // Update driver record
  driver = await driver.put({ 
    custId: parseInt(applicant.custId, 10),
    discordId: member.id, 
    active: true, 
    license, 
    careerStats: stats 
  });
  
  // Ask to choose a number. Teach !number and !drivers command.
  channel.send(`What number would you like to use? Message \`!drivers\` to see what's currently in use, then message \`!number xx\` to request your choice.`);
  
  // Ask member to set number and loop until it's approved
  let approved = false;
  let number = null;
  do {
    // Wait for the member to run a number command
    const approval = await channel.awaitMessages(
      msg => msg.content.startsWith('!number'),
      { max: 1 }
    ).then((collected) => {
      // Extract the number from the message
      const msg = collected.first();
      number = msg.content.split(/\s/)[1];
      
      // Keep informed
      channel.send(`Well chosen. I'll let you know when it's been reviewed.`)
      
      // Return the captured message
      return collected.first();
    });

    // Wait for the number to be approved
    approved = await approval.awaitReactions((reaction, user) => {
      return reaction.emoji.name === REACTION_ACCEPT || reaction.emoji.name === REACTION_DENY
    }, { max: 1 }).then(collected => collected.firstKey() === REACTION_ACCEPT);
    
    // If not approved, repeat the above process.
    if (!approved) 
      channel.send(`The admins didn't like that number. Try again.`);
    
  } while (!approved)

  channel.send('Your number choice has been approved!');
  
  // Update guild nickname to number + name.
  member.setNickname(`#${number} ${applicant.Name}`, 'League guidelines');
  
  // Inform them of the nickname update.
  channel.send(`I updated your Discord nickname to **#${number} ${applicant.Name}** so everyone knows who you are.`);
  channel.send(`You can change it, but just make sure your assigned number and real name are in there, like **#26 Ricky Botty**.`);
  
  const embed = new Discord.MessageEmbed()
  	.setAuthor(
      member.displayName,
      member.user.displayAvatarURL()
    )
  	.setTitle('iRacing Career Stats')
    .addField('Member Since', `\`${moment(memberSince, "DD-MM-YYYY").format('MMMM Do, YYYY')}\``)
  	.addFields(
      { name: 'License', value: `\`${license.licGroupDisplayName}\``, inline: true },
      { name: 'SR', value: `\`${license.srPrime}.${license.srSub}\``, inline: true },
      { name: 'iRating', value: `\`${(parseInt(license.iRating)/1000).toFixed(1)}k\``, inline: true },
      { name: 'Starts', value: `\`${stats.starts}\``, inline: true },
      { name: 'Inc/Race', value: `\`${stats.avgIncPerRace.toFixed(2)}\``, inline: true },
      { name: 'Laps', value: `\`${stats.totalLaps}\``, inline: true },
      { name: 'Win %', value: `\`${stats.winPerc.toFixed(2)}%\``, inline: true },
      { name: 'Top 5%', value: `\`${stats.top5Perc.toFixed(2)}%\``, inline: true },
      { name: 'Led %', value: `\`${stats.lapsLedPerc.toFixed(2)}%\``, inline: true },
  	)
	.setTimestamp();

  // Send message to general channel welcoming new member
  member.client.channels.cache.get(generalChannelId)
    .send(`Hey everyone, **${member.displayName}** just joined the league!`, { embed });
  
  // Overview other commands available through bot.
  channel.send(`That was the last thing I needed. Good luck out there!`);
  channel.send(`Check out \`!help\` for more things to do, like get the current league standings with \`!standings\` or the latest race results with \`!results latest\`.`);
}