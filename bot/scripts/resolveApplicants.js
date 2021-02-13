const Discord = require('discord.js');
const Promise = require('bluebird');
const moment = require('moment');
const { applicationsChannelId } = require('../config.json');
const { getUnresolved, getApplicants, resolveApplicant } = require('../lib/applications');

const client = new Discord.Client();

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag} for scripts/next.`);
  
    try {
      await Promise.map(
        // await getApplicants(), 
        await getUnresolved(), 
        async (applicant) => {
          const { custId, license, stats, memberSince } = await resolveApplicant(applicant.Name, applicant.rowNumber);
          
          if (!custId) return console.log(`${applicant.Name} not found`);

          // Notify applications channel
          const embed = new Discord.MessageEmbed()
          	.setTitle('League Application Received')
            .setDescription(`[${applicant.Name}](https://members.iracing.com/membersite/member/CareerStats.do?custid=${custId}) applied to the league.`)
            .addField('How did you hear about us?', `\`${applicant['How did you hear about us?']}\``)
            .addField('Name Of Member Who Referred You', `\`${applicant['Name Of Member Who Referred You']}\``)
            .addField('Tell Us About Yourself', `\`${applicant['Tell Us About Yourself']}\``)
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
          	.setTimestamp()
            
          console.log(applicant.Name, { custId, license, stats, memberSince })
          await client.channels.cache.get(applicationsChannelId).send(embed);  
        }, 
        { concurrency: 1 }
      );
      
      client.destroy();      
    } catch(err) {
      console.log(err);
    }      

});

client.login(process.env.DISCORD_ACCESS_TOKEN);