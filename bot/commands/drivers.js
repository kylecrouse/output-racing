const Discord = require('discord.js');
const league = require(`${process.cwd()}/lib/league`);

module.exports = {
	name: 'drivers',
	description: 'Display the league\'s active drivers.',
  args: false,
	execute: async (message) => {
    
    await league.init();
    
    const drivers = league.drivers
      .filter(driver => driver.active)
      .sort((a, b) => parseInt(a.number || 1000) - parseInt(b.number || 1000));
    
    const embed = new Discord.MessageEmbed()
    	.setTitle('Output Racing League Drivers')
    	.setURL(`https://outputracing.com/drivers/`)
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo-stacked.png')
    	.setTimestamp()
      
    let index, length, array, chunk = 25;
    for (let index = 0, length = drivers.length; index < length; index += chunk) {
      array = drivers.slice(index, index + chunk);
      embed.addFields(
    		{ name: index === 0 ? '#' : '\u200b', 
          value: array.map(driver => `\`${driver.number || '-'}\``), 
          inline: true 
        },
    		{ name: index === 0 ? 'Driver' : '\u200b', 
          value: array.map(driver => `\`${driver.nickname || driver.name}\``), 
          inline: true 
        },
    		{ name: index === 0 ? 'License' : '\u200b', 
          value: array.map(driver => `\`${driver.license.licGroupDisplayName.replace('Class ','')} ${driver.license.srPrime}.${driver.license.srSub} / ${(parseInt(driver.license.iRating)/1000).toFixed(1)}k / ${driver.careerStats ? driver.careerStats.avgIncPerRace.toFixed(2) : '?.??'}x\``), 
          inline: true 
        }
      );
    }
      
    message.channel.send(embed);

	},
};