const Discord = require('discord.js');
const moment = require('moment');
const { tracks } = require ('../../constants');

module.exports = {
  getUpcomingEmbed: (league) => {
    const race = league.getNextRace();
    
    //Slice content around the desired heading
    let startIndex = league.raceInfo.content.findIndex(
      item => item.nodeType === 'heading-3' && item.content[0].value.match(/^start times/i)
    );
    let endIndex = league.raceInfo.content.findIndex(
      (item, index) => index > startIndex && item.nodeType === 'heading-3'
    );

    const times = league.raceInfo.content.slice(startIndex + 1, endIndex);

    //Slice content around the desired heading
    startIndex = league.raceInfo.content.findIndex(
      item => item.nodeType === 'heading-3' && item.content[0].value.match(/^conditions/i)
    );
    endIndex = league.raceInfo.content.findIndex(
      (item, index) => index > startIndex && item.nodeType === 'heading-3'
    );

    const conditions = league.raceInfo.content.slice(startIndex + 1, endIndex);
    
    const embed = new Discord.MessageEmbed()
    	.setTitle('Next Race')
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo-stacked.png')
      .addField(race.name, race.track)
      .addField('\u200b', times.reduce(
        (fields, { nodeType, content }) => {
          content = content
            .map(({ data, nodeType, value, content }) => {
              fields.push(`**${content[0].content[0].value}**${content[0].content[1].value}`)
            })
            .join('');
          return fields;
        }, 
        []
      ))
      .addField('\u200b', conditions.reduce(
        (fields, { nodeType, content }) => {
          content = content
            .map(({ data, nodeType, value, content }) => {
              fields.push(`**${content[0].content[0].value}**${content[0].content[1].value}`)
            })
            .join('');
          return fields;
        }, 
        []
      ))
      .setImage(
        tracks.find(({ name }) => race.track.indexOf(name) >= 0).logo
      )    	
      .setTimestamp();
      
    return embed;
  },
  getResultsEmbed: async (race) => {
    const results = race.results.sort((a,b) => a.finish - b.finish);

    const embed = new Discord.MessageEmbed()
    	.setTitle(race.name)
    	.setURL(`https://outputracing.com/results/${race.raceId}/`)
      .addField(moment(race.date).format('dddd, MMMM Do YYYY'), `${race.track}\u000a${race.laps} laps (${race.cautions} cautions for ${race.cautionLaps} laps)`)
    	.addFields(
    		{ name: 'P', value: results.map(item => `\`${item.finish}\``), inline: true },
    		{ name: 'Driver', value: results.map(item=> `\`${item.name}\``), inline: true },
    		{ name: 'Interval', value: results.map(item=> `\`${item.interval}\``), inline: true },
    	)
    	.setTimestamp()
      
    if (race.logo) {
      const logo = await cms.getAsset(race.logo.sys.id);
      embed.setThumbnail(`https:${logo.fields.file['en-US'].url}`);
    } else {
      embed.setThumbnail(
        tracks.find(({ name }) => race.track.indexOf(name) >= 0).logo
      );
    }
    
    if (race.media) {
      const media = await cms.getAsset(race.media[0].sys.id);
      embed.setImage(`https:${media.fields.file['en-US'].url}`);
    }
    
    return embed;
  },
  getStandingsEmbed: (season) => {
    const standings = season.standings.sort((a,b) => a.position - b.position);
    
    const scheduled = season.schedule.filter(race => race.counts);
    const completed = season.results.filter(
      race => scheduled.find(({ raceId }) => raceId == race.raceId)
    );
    
    const embed = new Discord.MessageEmbed()
    	.setTitle('Current Standings')
    	.setURL(`https://outputracing.com/standings/${season.id}/`)
      .addField(season.name, `After ${completed.length} of ${scheduled.length} races`)
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo-stacked.png')
    	.addFields(
    		{ name: 'Pos.', value: standings.map(item => `\`${item.position} ${item.change !== '-' ? '(' + item.change + ')' : ''}\``), inline: true },
    		{ name: 'Driver', value: standings.map(item => `\`${item.driver}\``), inline: true },
    		{ name: 'Points', value: standings.map((item, index) => `\`${item.points} ${item.behindNext !== '-' ? '(' + item.behindNext + ')': index > 0 ? '(0)' : ''}\``), inline: true },
    	)
    	.setTimestamp()

    return embed;
  }
}