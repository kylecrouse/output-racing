const Discord = require('discord.js');
const { reject } = require('../lib/applications');
const { isAuthorized } = require('../lib/authorization');

module.exports = {
	name: 'reject',
	description: 'Reject the specified applicant.',
  args: true,
  usage: '"<member name>" ["<reason>"]',
	execute: async (message, args) => {
    
    if (!isAuthorized(message.author, message.channel)) return;
    
    await reject(args[0], args[1]);
        
    message.react('✅');

	},
};