const Discord = require('discord.js');
const moment = require('moment');
const { getPending } = require('../lib/applications');

module.exports = {
	name: 'pending',
	description: 'Display all pending applicants, or details of specified applicant.',
  args: false,
  usage: '["<member name>"]',
	execute: async (message, args) => {
    
    const applicants = await getPending(args[0]);
    
    if (!applicants) 
      return args[0] 
        ? message.reply(`No pending application found for **${args[0]}**.`)
        : message.reply('No pending applicants.');

    // Handle multiple applicants matching query.
    if (Array.isArray(applicants)) {
      
      const embed = new Discord.MessageEmbed()
      	.setTitle('Pending League Applications')
        .addFields(
          { 
            name: 'Driver', 
            value: applicants.map(applicant => `\`${applicant.Name}\``), 
            inline: true 
          },
          { 
            name: 'Ratings', 
            value: applicants.map(applicant => `\`${applicant["Overall inc / Current IR, SR, Class"]}\``), 
            inline: true 
          },
          { 
            name: 'Applied', 
            value: applicants.map(applicant => `\`${moment(applicant["Timestamp"]).format('MM-DD-YYYY')}\``), 
            inline: true 
          },
        )
        .setTimestamp();
        
      message.channel.send(embed);
    }
    
    // Handle single applicant matching query
    else {
      const embed = new Discord.MessageEmbed()
      	.setTitle(`${applicants.Name}'s League Application`)
        .setURL(`https://members.iracing.com/membersite/member/CareerStats.do?custid=${applicants.custId}`)
        .addFields(
          { name: 'Application Date', value: `\`${moment(applicants.Timestamp).format('MMMM Do, YYYY')}\`` },
          { name: 'Status', value: `\`${applicants['Approved']}\`` },
          { name: 'How did you hear about us?', value: `\`${applicants['How did you hear about us?']}\`` },
          { name: 'Referred By', value: `\`${applicants['Name Of Member Who Referred You'] || 'N/A'}\``},
          { name: 'Tell us about yourself', value: `\`${applicants['Tell Us About Yourself']}\``},
          { name: 'Member Since', value: `\`${moment(applicants['Member Since'], "DD-MM-YYYY").format('MMMM Do, YYYY')}\``},
          { name: 'License', value: `\`${applicants['License']}\``, inline: true },
          { name: 'SR', value: `\`${applicants['SR']}\``, inline: true },
          { name: 'iRating', value: `\`${applicants['iR']}\``, inline: true },
          { name: 'Starts', value: `\`${applicants['Starts']}\``, inline: true },
          { name: 'Inc/Race', value: `\`${applicants['Inc']}\``, inline: true },
          { name: 'Laps', value: `\`${applicants['Laps']}\``, inline: true },
          { name: 'Win %', value: `\`${applicants['Wins']}\``, inline: true },
          { name: 'Top 5%', value: `\`${applicants['Top 5s']}\``, inline: true },
          { name: 'Led %', value: `\`${applicants['Led']}\``, inline: true },
      	)
      	.setTimestamp()
        
      message.channel.send(embed); 
    }

	},
};