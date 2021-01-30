const Discord = require('discord.js');
const { isAuthorized } = require('../lib/authorization');
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

module.exports = {
	name: 'say',
	description: 'Tell the bot to say something, optionally in a specific channel.',
  args: true,
  usage: '"message" [<channel name>]',
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return message.reply('denied!');
    
    if (args[1]) {
      const channel = message.client.channels.cache.find(channel => channel.name === args[1]);
      if (channel) {
        await channel.send(args[0]);
        message.react(REACTION_SUCCESS);
      }
      else {
        message.react(REACTION_FAILURE);
      }
    }
    else {
      await message.channel.send(args[0]);
      message.react(REACTION_SUCCESS);
    }

	},
};