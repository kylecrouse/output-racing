const Discord = require('discord.js');
const moment = require('moment');
const { getPending } = require('../lib/applications');

module.exports = {
	name: 'pending',
	description: 'Display all pending applicants, or details of specified applicant.',
  args: false,
  usage: '["<member name>"]',
	execute: async (message, args) => {
    
    const applicants = await getPending();
    
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

	},
};