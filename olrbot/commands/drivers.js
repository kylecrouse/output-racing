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
      .sort((a, b) => parseInt(a.number) - parseInt(b.number));
    
    const embed = new Discord.MessageEmbed()
    	.setTitle('Output Racing League Drivers')
    	.setURL(`http://dnhi063vpnzuy.cloudfront.net/drivers/`)
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo.png')
    	.addFields(
    		{ name: '#', value: drivers.map(driver => `\`${driver.number}\``), inline: true },
    		{ name: 'Driver', value: drivers.map(driver => `\`${driver.nickname || driver.name}\``), inline: true },
    		{ name: 'License', value: drivers.map(driver => `\`${driver.license.licGroupDisplayName.replace('Class ','')} ${driver.license.srPrime}.${driver.license.srSub} / ${(parseInt(driver.license.iRating)/1000).toFixed(1)}k\``), inline: true },
    	)
    	.setTimestamp()
      
    message.channel.send(embed);

	},
};