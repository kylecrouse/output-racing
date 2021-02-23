const Discord = require('discord.js');
const moment = require('moment');
const league = require(`${process.cwd()}/lib/league`);
const { tracks } = require ('../../constants');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'schedule',
	description: 'Display current schedule, or a specific|next season',
  args: false,
  usage: '[next|<schedule id>]',
	execute: async (message, args) => {
    
    await league.init();

    const season = args.length > 0
      ? args[0] === 'next'
        ? league.seasons[0].id !== league.season.id 
          ? league.seasons[0] 
          : null
        : league.seasons.find(season => season.id == args[0])
      : league.season;
      
    if (!season) return;
    
    const remaining = season.schedule.filter(props => !props.raceId);
    const completed = season.results || [];
    const races = season.schedule.filter(props => !props.offWeek);
    
    const embed = new Discord.MessageEmbed()
    	.setTitle(season.name)
    	.setURL(`https://outputracing.com/schedule/${season.id}/`)
      .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo-stacked.png')
      .addFields({
        name: 'Cars',
        value: season.cars.join(`\n`)
      })
    	.setTimestamp()
      
    if (remaining.length > 0) {
    	embed.addFields({
        name: `${remaining.filter(props => !props.offWeek).length} of ${races.length} races remaining`,
        value: remaining.map(
          props => {
            return `- **${moment.parseZone(props.date).format('M/D')}** ${props.offWeek
              ? '*Off Week*'
              : `${props.track} *(${props.laps ? `${props.laps}\u00A0laps` : props.time})*` 
            }`;
          }
        )
      })      
    }

    if (completed.length > 0) {
      embed.addFields({
        name: `${completed.filter(props => !props.offWeek).length} of ${races.length} races completed`,
        value: completed.sort((a, b) => moment(a.date).diff(b.date)).map(
          props => {
            return `- **${moment.parseZone(props.date).format('M/D')}** ${props.offWeek
              ? '*Off Week*'
              : props.track
            }`;
          }
        )
      })
    }
      
    message.channel.send(embed);      

	},
};