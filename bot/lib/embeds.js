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
  getStandingsEmbed: (league) => {
    const { season, drivers } = league;
    const standings = season.standings.length > 0 
      ? season.standings.sort((a,b) => a.position - b.position)
      : drivers.filter(driver => driver.active)
          .sort((a, b) => parseInt(a.number || 1000, 10) - parseInt(b.number || 1000, 10))
          .map((driver, index) => ({
            position: index + 1,
            driver: driver.nickname || driver.name,
            points: 0,
            change: '-',
            behindNext: '-'
          }));
    
    const scheduled = season.schedule.filter(race => race.counts);
    const completed = Array.isArray(season.results)
      ? season.results.filter(
          race => scheduled.find(({ raceId }) => raceId == race.raceId)
        )
      : [];
    
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
  },
  getIncidentsEmbed: (season, drivers) => {
    
    const stats = season.stats
      .filter(({ driver }) => {
        const match = drivers.find(({ name }) => name == driver);
        return match && match.active;
      })
      .sort((a, b) => (a.incidentsLap - b.incidentsLap) || (a.incidentsRace - b.incidentsRace));
    
    const scheduled = season.schedule.filter(race => race.counts);
    const completed = Array.isArray(season.results)
      ? season.results.filter(
          race => scheduled.find(({ raceId }) => raceId == race.raceId)
        )
      : [];    

    const embed = new Discord.MessageEmbed()
    	.setTitle('Incident Report')
      .addField(season.name, `After ${completed.length} of ${scheduled.length} races`)
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo-stacked.png')
    	.addFields(
    		{ name: 'Driver', value: stats.map(item => `\`${item.driver}\``), inline: true },
    		{ name: 'Inc/Lap', value: stats.map(item => `\`${item.incidentsLap}\``), inline: true },
    		{ name: 'Inc/Race', value: stats.map(item => `\`${item.incidentsRace}\``), inline: true },
    	)
    	.setTimestamp()

    return embed;
    
  },
  getAttendanceEmbed: (season, drivers) => {
    
    const stats = season.stats
      .filter(({ driver }) => {
        const match = drivers.find(({ name }) => name == driver);
        return match && match.active;
      })
      .map(({ starts, driver }) => {
        const streak = season.results
          .filter(({ raceId }) => {
            const race = season.schedule.find(race => race.raceId == raceId);
            return race.counts;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .reduce((streak, race) => {
            return !!race.results.find(({ name }) => name == driver)
              ? 0 
              : ++streak;
          }, 0);
        return { starts, driver, streak };
      })
      .sort((a, b) => (b.starts - a.starts) || (a.streak - b.streak));
    
    const scheduled = season.schedule.filter(race => race.counts);
    const completed = Array.isArray(season.results)
      ? season.results.filter(
          race => scheduled.find(({ raceId }) => raceId == race.raceId)
        )
      : [];    

    const embed = new Discord.MessageEmbed()
    	.setTitle('Attendance Report')
      .addField(season.name, `After ${completed.length} of ${scheduled.length} races`)
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo-stacked.png')
    	.addFields(
    		{ name: 'Driver', value: stats.map(item => `\`${item.driver}\``), inline: true },
    		{ name: 'Starts', value: stats.map(item => `\`${item.starts}\``), inline: true },
    		{ name: 'Streak', value: stats.map(item => `\`${item.streak}\``), inline: true },
    	)
    	.setTimestamp()

    return embed;
    
  }  
}