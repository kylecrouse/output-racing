const Discord = require('discord.js');
const fetch = require('node-fetch');
const sharp = require('sharp');
const league = require(`${process.cwd()}/lib/league`);
const cms = require(`${process.cwd()}/lib/contentful`)
const util = require('util');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'stats',
	description: 'Show career stat line for a specific driver',
  args: true,
  usage: '@<user>',
	execute: async (message, args) => {
    
    // Ensure data is ready
    await league.init();
    
    // Get out of here if no one was mentioned
    if (!message.mentions.users) return message.react(REACTION_FAILURE);
    
    // Find all the mentioned drivers and translate to embed
    await Promise.all(
      message.mentions.users.map(async (user) => {
        
        const { fields: driver } = league.findDriver({ field: "discordId", value: user.id });
        
        if (!driver) {
          message.reply("I don't know which driver profile is yours. Use `!link <your car number>` and then try again.");
          return;
        }
        
        const stats = league.getStats(driver.name['en-US']);
        
        const embed = new Discord.MessageEmbed()
        	.setAuthor(
            message.guild && message.guild.member(user) 
              ? message.guild.member(user).displayName 
              : user.username, 
            user.displayAvatarURL()
          )
        	.setTitle('Output Racing League Career Stats')
        	.setURL(`http://dnhi063vpnzuy.cloudfront.net/driver/${driver.name['en-US'].replace(/\s/g, '-').toLowerCase()}/`)
        	.addFields(
        		{ name: 'Starts', value: stats.starts, inline: true },
        		{ name: 'Wins', value: `${stats.wins} (${stats.winPercentage})`, inline: true },
        		{ name: 'Top 5s', value: `${stats.top5s} (${stats.top5Percentage})`, inline: true },
        		{ name: 'Poles', value: `${stats.poles} (${((stats.poles || 0) / (stats.starts || 1) * 100).toFixed(0)}%)`, inline: true },
        		{ name: 'Laps Led', value: `${stats.lapsLed} (${((parseInt(stats.lapsLed.replace(',','')) / parseInt((stats.laps || '0').replace(',',''))) * 100).toFixed(0)}%)`, inline: true },
        		{ name: 'Inc/Lap', value: `${stats.incidentsLap}`, inline: true },
        	)
        	.setTimestamp();
          
        if (driver.numberArt) {
          const numberArt = await cms.getAsset(driver.numberArt['en-US'].sys.id);
          if (numberArt.fields.file['en-US'].contentType === 'image/svg+xml') {
            const response = await fetch(`https:${numberArt.fields.file['en-US'].url}`);
            const buffer = await response.buffer();
            embed.attachFiles([{ name: 'number.png', attachment: await sharp(buffer).toBuffer() }]);
            embed.setThumbnail('attachment://number.png');
          } 
          else 
            embed.setThumbnail(`https:${numberArt.fields.file['en-US'].url}`);
        }
        
        if (driver.media) {
          const asset = driver.media['en-US'].pop();
          const media = await cms.getAsset(asset.sys.id);
          embed.setImage(`https:${media.fields.file['en-US'].url}`);
        }
          
        message.channel.send(embed);
      })
    );

	},
};