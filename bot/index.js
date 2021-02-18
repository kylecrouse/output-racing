const client = require('./lib/discord');
const handleMessage = require('./handlers/message');
const handleGuildMemberAdd = require('./handlers/guildMemberAdd');

client.on('message', handleMessage);  
client.on('guildMemberAdd', handleGuildMemberAdd);
