const Discord = require('discord.js');
const moment = require('moment-timezone');
const cms = require(`${process.cwd()}/lib/contentful`);
const { tracks, timeOfDay } = require ('../../constants');

module.exports = {
  getSessionEmbed: async (session, race) => {
    const track = tracks.find(({ name }) => race.track.indexOf(name) >= 0);
    
    const embed = new Discord.MessageEmbed()
    	.setTitle(`**${session.league_season_id == 51244 ? 'Practice Session' : race.name}**`)
      .addField(
        `**${moment(session.launchat).tz("America/Los_Angeles").format('dddd, MMMM Do')}**`,
        `Practice: ${moment(session.launchat).tz("America/Los_Angeles").format('h:mma z')} (${session.practicedur} min)\u000AQual: ${moment(session.launchat).add(session.practicedur, 'm').tz("America/Los_Angeles").format('h:mma z')} (${session.qualifylaps} laps/${session.qualifylength} min)\u000AGrid: ${moment(session.launchat).add(session.practicedur + session.qualifylength, 'm').tz("America/Los_Angeles").format('h:mma z')}`
      )
      .addField(
        `\u200B\u000A**${track.name}**`, 
        `Time of Day: ${timeOfDay[session.timeOfDay]}\u000A` +
        `${session.config_name ? `Configuration: ${session.config_name}\u000A` : ''}` +
        `Distance: ${session.racelaps} laps\u000A` +
        `Weather: ${session.weather_type == 1 ? 'dynamic weather/sky' : ''}\u000A` +
        `Conditions: practice ${session.rubberlevel_practice}%, qual ${session.rubberlevel_qualify == -1 ? 'carries over' : `${session.rubberlevel_qualify}%`}, race ${session.rubberlevel_race == -1 ? 'carries over' : `${session.rubberlevel_race}%`}\u000A` +
        `G/W/C: ${session.gwclimit} attempts`
      )
      .addField(
        '\u200B\u000A',
        `**${session.cars.length > 1 ? 'Cars' : 'Car'}:** ${makeCommaSeparatedString(session.cars.map(car => car.car_name))}\u000A` +
        `**Setup:** ${session.fixedSetup ? `fixed (${session.cars[0].racesetupfilename})` : 'open'}\u000A` +
        `**Fuel:** ${session.cars[0].max_pct_fuel_fill}%\u000A` +
        `**Tires:** ${session.cars[0].max_dry_tire_sets != 0 ? `${session.cars[0].max_dry_tire_sets} sets (starting + ${session.cars[0].max_dry_tire_sets - 1})` : 'unlimited'}\u000A` +
        `**Fast Repairs:** ${session.numfasttows}\u000A` +
        `**Incident Limit:** ${session.incident_warn_mode ? `${session.incident_warn_param1}x (penalty)\u000a${session.incident_limit}x (disqualify)` : `${session.incident_limit}x`}`
      )
      .setTimestamp();
      
    if (race.logo) {
      const logo = await cms.getAsset(race.logo.sys.id);
      embed.setThumbnail(`https:${logo.fields.file['en-US'].url}`);
    } else {
      embed.setThumbnail(track.logo);
    }
      
    return embed;
  },
  getResultsEmbed: async (race) => {
    const results = race.results.sort((a,b) => a.finish - b.finish);

    const embed = new Discord.MessageEmbed()
    	.setTitle(race.name)
    	.setURL(`https://outputracing.com/results/${race.raceId}/`)
      .addField(moment.parseZone(race.date).format('dddd, MMMM Do YYYY'), `${race.track}\u000a${race.laps} laps (${race.cautions} cautions for ${race.cautionLaps} laps)`)
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
  },
  getNewsEmbed: (results, stats, league) => {
    const drivers = results.reduce(
      (drivers, r) => {
        return drivers.concat(
          r.rows.filter(i => i.simsesname == 'RACE' && league.drivers.filter(d => d.active).find(d => d.custId === i.custid))
        )
      }, 
      []
    );
    
    const splits = results.reduce(
      (splits, r) => {
        splits[r.sessionid] = Array.isArray(splits[r.sessionid]) ? splits[r.sessionid].concat([r.subsessionid]) : [r.subsessionid]
        splits[r.sessionid] = splits[r.sessionid].sort((a,b) => a - b);
        return splits;
      }, {}
    );

    const embed = new Discord.MessageEmbed()
      .setTitle(results[0].seasonid == 3122 ? 'eNASCAR Road to Pro Qualifying Series Race Report' : 'NASCAR iRacing Series Race Report')
      .setThumbnail(results[0].seasonid == 3122 ? 'https://outputracing.com/rtp-logo.png' : 'https://outputracing.com/nis-logo.png')
      .setDescription(
        drivers.length > 0 
          ? `${makeCommaSeparatedString(drivers.map(d => `<@${league.drivers.find(({ custId }) => custId == d.custid).discordId}>`))} raced in ${moment.utc(results[0].start_time).tz("America/Los_Angeles").format('dddd')}'s ${results[0].seasonid == 3122 ?  'RtP' : 'NiS'} events at ${results[0].track_name}. Here\'s a look at how they did:`
          : `No one from Output Racing League participated in ${moment.utc(results[0].start_time).tz("America/Los_Angeles").format('dddd')}'s ${results[0].seasonid == 3122 ?  'RtP' : 'NiS'} events at ${results[0].track_name}.`
      )
    	.setTimestamp()
      
    results.sort((a, b) => a.sessionid - b.sessionid || a.subsessionid - b.subsessionid).forEach(race => {
      const split = splits[race.sessionid].indexOf(race.subsessionid);
      race.rows
        .filter(i => i.simsesname == 'RACE' && league.drivers.filter(d => d.active).find(d => d.custId === i.custid))
        .sort((a, b) => a.carnum - b.carnum)
        .forEach((driver, index) => {
          const entry = league.drivers.find(({ custId }) => custId == driver.custid);
          const [firstName] = (entry.nickname || entry.name).split(' ');
          const stat = stats.find(s => s.custid == driver.custid && s.seasonid == race.seasonid);
          const bestlaptimepos = race.rows.filter(i => i.simsesname == 'RACE').sort((a,b) => a.bestlaptime - b.bestlaptime).findIndex(d => d.custid == driver.custid);
          embed.addField(
            `**#${driver.carnum} ${entry.nickname || entry.name}**`,
            `${firstName} ${driver.finishpos == 0
                ? `won the ${split === 0 ? 'top' : withOrdinal(split + 1)} ${race.seasonid !== 3122 ? race.seasonid == 3118 ? 'open ' : 'fixed ' : ''}split after starting ${withOrdinal(driver.startpos + 1)}!`
                : driver.finishpos <= 4 
                  ? `scored a top five in the ${split === 0 ? 'top' : withOrdinal(split + 1)} ${race.seasonid !== 3122 ? race.seasonid == 3118 ? 'open ' : 'fixed ' : ''}split, ${driver.finishpos < driver.startpos 
                      ? `coming from ${withOrdinal(driver.startpos + 1)} to finish ${withOrdinal(driver.finishpos + 1)}` 
                      : `finishing ${withOrdinal(driver.finishpos + 1)} after a ${withOrdinal(driver.startpos + 1)} place start`
                    }` 
                  : index > 0
                      ? `was also in the ${split === 0 ? 'top' : withOrdinal(split + 1)} ${race.seasonid !== 3122 ? race.seasonid == 3118 ? 'open ' : 'fixed ' : ''}split and finished ${withOrdinal(driver.finishpos + 1)} after starting ${withOrdinal(driver.startpos + 1)}`
                      : `started ${withOrdinal(driver.startpos + 1)} in the ${split === 0 ? 'top' : withOrdinal(split + 1)} ${race.seasonid !== 3122 ? race.seasonid == 3118 ? 'open ' : 'fixed ' : ''}split and finished ${withOrdinal(driver.finishpos + 1)}`
              }${driver.finishpos != 0 ? `, ${driver.interval > 0 ? `${(driver.interval / 10000).toFixed(driver.interval > 20000 ? 0 : 1)} seconds off the lead` : `${Math.abs(driver.interval)} ${driver.interval == -1 ? 'lap' : 'laps'} down`}.` : ''} He ${makeCommaSeparatedString([
                ...makeArray(getFastestLapFragment(driver.bestlaptime, bestlaptimepos)), 
                ...makeArray(getLapsLedFragment(driver.lapslead)), 
                `had ${driver.incidents == 0 ? 'no' : driver.incidents} incidents`
              ])}. ${index == 0 ? `This split had ${race.nleadchanges} lead changes among ${race.rows.filter(i => i.simsesname == 'RACE' && i.lapslead > 0).length} drivers and ${race.ncautions > 0 ? `${race.ncautions} ${race.ncautions == 1 ? 'caution' : 'cautions'} for ${race.ncautionlaps}` : `went green for all ${race.eventlapscomplete}`} laps with ${race.rows.filter(i => i.simsesname == 'RACE' && i.interval > 0).length} cars finishing on the lead lap. ` : ''}${firstName} ${driver.newsublevel >= driver.oldsublevel ? 'gained' : 'lost'} ${(Math.abs(driver.newsublevel - driver.oldsublevel) / 100).toFixed(2)} SR and his iRating ${driver.newirating >= driver.oldirating ? 'increased' : 'decreased'} ${Math.abs(driver.newirating - driver.oldirating)} to ${driver.newirating}. Through ${race.race_week_num + 1} ${race.race_week_num == 0 ? 'week' : 'weeks'} in the ${race.seasonid !== 3122 ? race.seasonid == 3118 ? 'open ' : 'fixed ' : ''}season, ${firstName} ${stat.topfive > 0 || race.race_week_num > 0 ? 'has ' : ''}${makeCommaSeparatedString([
                ... stat.wins > 0 ? [`${stat.wins} ${stat.wins == 1 ? 'win' : 'wins'}`] : [],
                ... stat.topfive > 0 ? [`${stat.topfive} top ${stat.topfive == 1 ? '5' : '5s'}`] : [],
                ... race.race_week_num > 0 ? [`an average finish of ${withOrdinal(stat.avgfinish)} in ${stat.starts} ${stat.starts == 1 ? 'start' : 'starts'}`] : [],
                ... race.seasonid == 3122 ? [stat.rank <= 70 ? `sits **within the cut at ${withOrdinal(stat.rank)} position**` : `ranks ${withOrdinal(stat.rank)} with ${stat.points} points`] : []
              ])}.${driver.finishpos == 0 ? ` **Congrats, ${firstName}!**` : ''}`
          )
        })
    });
      
    return embed;
  }
}

function getFastestLapFragment(bestlaptime, bestlaptimepos) {
  return bestlaptimepos === 0 && `logged the fastest lap of the race at ${(bestlaptime / 10000).toFixed(3)}`;
}

function getLapsLedFragment(lapsled) {
  return lapsled > 0 && `led ${lapsled} laps`;
}

function makeArray(str) {
  return str ? [str] : [];
}

function makeCommaSeparatedString(arr, useOxfordComma) {
  const listStart = arr.slice(0, -1).join(', ');
  const listEnd = arr.slice(-1);
  const conjunction = arr.length <= 1 ? '' :
    useOxfordComma && arr.length > 2 ? ', and ' : ' and ';

  return [listStart, listEnd].join(conjunction);
}

function withOrdinal(i) {
  const j = i % 10, k = i % 100;
  if (j == 1 && k != 11)
    return i + "st";
  if (j == 2 && k != 12)
    return i + "nd";
  if (j == 3 && k != 13)
    return i + "rd";
  return i + "th";
}

