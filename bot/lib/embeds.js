const Discord = require('discord.js');
const moment = require('moment');
const cms = require(`${process.cwd()}/lib/contentful`);
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
    const completed = season.schedule.filter(race => race.counts && race.uploaded);
    
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
    
    const scheduled = season.results.filter(race => race.counts);
    const completed = scheduled.filter(race => race.raceId);
    
    const maxLaps = stats.reduce((max, { laps }) => Math.max(max, laps.length), 0);
    const maxStarts = stats.reduce((max, { starts }) => Math.max(max, starts.length), 0);

    const embed = new Discord.MessageEmbed()
    	.setTitle('Incident Report')
      .addField(season.name, `After ${completed.length} of ${scheduled.length} races`)
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo-stacked.png')
    	.addFields(
    		{ name: 'Driver', value: stats.map(item => `\`${item.driver}\``), inline: true },
    		{ name: 'Incidents', value: stats.map(item => `\`${item.incidentsLap} / ${item.incidentsRace}\``), inline: true },
    		{ name: 'Laps / Starts', value: stats.map(item => `\`${item.laps.length < maxLaps ? '\u00a0'.repeat(maxLaps - item.laps.length) : ''}${item.laps} / ${item.starts.length < maxStarts ? '\u00a0'.repeat(maxStarts - item.starts.length) : ''}${item.starts}\``), inline: true },
    	)
    	.setTimestamp()

    return embed;
    
  },
  getAttendanceEmbed: (season, drivers) => {
    
    const stats = drivers
      .filter(driver => driver.active)
      .map(driver => {
        const { starts = 0 } = season.stats.find(props => props.driver === driver.name) || {};
        
        const streak = season.results
          .filter(race => race.raceId && race.counts)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .reduce((streak, race) => {
            return !!race.results.find(({ name }) => name == driver.name)
              ? 0 
              : ++streak;
          }, 0);
        
        return { driver: driver.nickname || driver.name, starts, streak };
      })
      .filter(({ streak }) => streak > 0)
      .sort((a, b) => (b.starts - a.starts) || (a.streak - b.streak));
    
    const scheduled = season.results.filter(race => race.counts);
    const completed = scheduled.filter(race => race.raceId);

    const embed = new Discord.MessageEmbed()
    	.setTitle('Attendance Report')
      .addField(season.name, `After ${completed.length} of ${scheduled.length} races`)
      .setThumbnail('https://outputracing.com/logo-stacked.png')
    	.addFields(
    		{ name: 'Driver', value: stats.map(item => `\`${item.driver}\``), inline: true },
    		{ name: 'Starts', value: stats.map(item => `\`${item.starts}\``), inline: true },
    		{ name: 'Streak', value: stats.map(item => `\`${item.streak}\``), inline: true },
    	)
    	.setTimestamp()

    return embed;
    
  },
  getApplicantEmbed: (namedValues, custId, license = {}, stats = {}, memberSince) => {
    const embed = new Discord.MessageEmbed()
    	.setTitle('League Application Received')
      .setDescription(`[${namedValues.Name[0]}](https://members.iracing.com/membersite/member/CareerStats.do?custid=${custId}) applied to the league.`)
      .addFields(
        Object.entries(namedValues).reduce((fields, [name, value]) => { 
          if (name !== "Name" && name !== "Email" && name !== "Timestamp" && name !== "Rules" && value[0])
            fields.push({ name, value: `\`${value[0]}\`` });
          return fields; 
        }, [])
      )
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

    return embed;
  }
}
