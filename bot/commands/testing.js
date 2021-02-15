const Discord = require('discord.js');
const league = require(`${process.cwd()}/lib/league`);
const moment = require('moment');
const { tracks } = require ('../../constants');

module.exports = {
  name: 'testing',
  description: 'Show testing results for next (or upcoming) race, or testing detail for mentioned driver.',
  args: false,
  usage: '[@<user>] ["track"]',
  execute: async (message, args) => {

    await league.init();
    
    const race = league.getNextRace();
    
    const track = tracks.find(({ name }) => race.track.indexOf(name) >= 0);
    
    if (!race.testing) return message.reply(`no one has logged testing for ${track.name}.`);
      
    const embed = new Discord.MessageEmbed()
      .setTitle(`Pre-Race Testing Data`)
      .setThumbnail(track.logo)
      .addField(race.name, `${track.name}\n${moment(race.date).format('dddd, MMMM Do YYYY')}`)
      .addFields(
        Object.entries(race.testing).map(([id, record]) => {
          const driver = league.drivers.find(driver => driver.id === id);
          return { 
            name: driver.nickname || driver.name, 
            value: `\`Best time: ${record.best}\nTrack temp: ${record.tracktemp}\``,
            inline: true
          };
        })
      )
      .setTimestamp()
      
    message.channel.send(embed);

  },
};