const Discord = require('discord.js');
const moment = require('moment');
const { kick } = require('../lib/applications');
const { isAuthorized } = require('../lib/authorization');

module.exports = {
	name: 'kick',
	description: 'Kick member from the league.',
  args: false,
  usage: '["<member name>"]',
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
    
    await kick(args[0]);
        
    message.channel.send(`**${args[0]}** is gone. Fuck that guy.`);

	},
};