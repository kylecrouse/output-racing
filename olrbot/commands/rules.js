const Discord = require('discord.js');
const moment = require('moment');
const league = require(`${process.cwd()}/lib/league`);
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'rules',
	description: 'Display league rules.',
  args: false,
	execute: async (message, args) => {
    
    try {
      await league.init();

      const embed = new Discord.MessageEmbed()
      	.setTitle('Output Racing League Rulebook')
        .setDescription(`Last updated ${moment().format('MMMM Do, YYYY')}`)
        .setThumbnail('http://output-racing.s3-website.us-west-2.amazonaws.com/logo.png')
        .setTimestamp();
        
      const fields = league.rules.content.reduce(
        (fields, { nodeType, content }) => {
          content = content
            .map(({ data, nodeType, value, content }) => {
              if (nodeType === 'text') 
                return value;
              else if (nodeType === 'hyperlink') 
                return `[${content[0].value}](${data.uri})`;
              else 
                return '';
            })
            .join('');
          if (nodeType === 'heading-3')
            fields.push({ name: content, value: [] });
          else if (nodeType === 'paragraph')
            fields[fields.length - 1].value.push(`\u2022\u00a0${content}`);
          return fields;
        }, 
        []
      );
      
      embed.addFields(fields);
        
      message.channel.send(embed);      
    }
    catch(error) {
      console.error(error);
      message.react(REACTION_FAILURE);
    }

	},
};
