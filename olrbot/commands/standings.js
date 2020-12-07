const Discord = require('discord.js');
const league = require(`${process.cwd()}/lib/league`);

module.exports = {
	name: 'standings',
	description: 'Display standings for the current season',
  args: false,
	execute: async (message) => {
    
    await league.init();
    
    const { fields: season } = league.season;
    
    const standings = season.standings['en-US'].sort((a,b) => a.position - b.position);

    const embed = new Discord.MessageEmbed()
    	.setTitle('Current Standings')
    	// .setURL(`http://dnhi063vpnzuy.cloudfront.net/standings/`)
      .setDescription(`After ${season.results['en-US'].length} of ${season.schedule['en-US'].length} races`)
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo.png')
    	.addFields(
    		{ name: 'Pos.', value: standings.map(item => `${item.position} ${item.change !== '-' ? '(' + item.change + ')' : ''}`).join('\u000a'), inline: true },
    		{ name: 'Driver', value: standings.map(item => item.driver).join('\u000a'), inline: true },
    		{ name: 'Points', value: standings.map((item, index) => `${item.points} ${item.behindNext !== '-' ? '(' + item.behindNext + ')': index > 0 ? '(0)' : ''}`).join('\u000a'), inline: true },
    	)
    	.setTimestamp()
      
    message.channel.send(embed);

	},
};