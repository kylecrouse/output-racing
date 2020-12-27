const Discord = require('discord.js');
const league = require(`${process.cwd()}/lib/league`);

module.exports = {
	name: 'standings',
	description: 'Display standings for the current season',
  args: false,
	execute: async (message) => {
    
    await league.init();
    
    const standings = league.season.standings.sort((a,b) => a.position - b.position);
    
    const scheduled = league.season.schedule.filter(race => race.counts);
    const completed = league.season.results.filter(
      race => scheduled.find(({ raceId }) => raceId == race.raceId)
    );
    
    const embed = new Discord.MessageEmbed()
    	.setTitle('Current Standings')
    	.setURL(`http://dnhi063vpnzuy.cloudfront.net/standings/${league.season.id}/`)
      .addField(league.season.name, `After ${completed.length} of ${scheduled.length} races`)
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo-stacked.png')
    	.addFields(
    		{ name: 'Pos.', value: standings.map(item => `\`${item.position} ${item.change !== '-' ? '(' + item.change + ')' : ''}\``), inline: true },
    		{ name: 'Driver', value: standings.map(item => `\`${item.driver}\``), inline: true },
    		{ name: 'Points', value: standings.map((item, index) => `\`${item.points} ${item.behindNext !== '-' ? '(' + item.behindNext + ')': index > 0 ? '(0)' : ''}\``), inline: true },
    	)
    	.setTimestamp()
      
    message.channel.send(embed);

	},
};