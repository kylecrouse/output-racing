const fs = require('fs');
const Discord = require('discord.js');
const handleGuildMemberAdd = require('./handlers/guildMemberAdd');
const { prefix } = require('./config.json');
const { getSecretValue } = require('../lib/secrets');

(async () => {
  // const client = new discord.Client({ ws: { intents: discord.Intents.FLAGS.GUILD_MEMBERS }});
  const client = new Discord.Client();
  
  // Set all recognized commands for bot from ./command/*.js
  client.commands = new Discord.Collection();
  const commandFiles = fs.readdirSync(`${__dirname}/commands`)
    .filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
  	const command = require(`${__dirname}/commands/${file}`);
  	// set a new item in the Collection
  	// with the key as the command name and the value as the exported module
  	client.commands.set(command.name, command);
  }
  
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
  client.on('message', async (message) => {
    // console.log(message);
    
    // Exit if there is no command or message is from a bot.
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    // Get message command (i.e., !command) and args
    // Use regex that doesn't split inside quotes but doesn't match them either
    const regex = /[^\s"“]+|["“]([^"”]*)["”]/gi;
    const string = message.content.slice(prefix.length).trim();
    let args = [], match = null;
    //Each call to exec returns the next regex match as an array
    do {
      match = regex.exec(string);
      if (match) args.push(match[1] ? match[1] : match[0]);
    } while (match);
    const commandName = args.shift().toLowerCase();
  
    // Get the requested command
    const command = client.commands.get(commandName)
      || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));;
    
    // If the command is not recognized, exit.  
    if (!command) return;
    
    // Validate required args or exit with proper usage
    if (command.args && !args.length) {
      let reply = `You're missing something, ${message.author}.`;
      if (command.usage) {
        reply += `\nTry: \`${prefix}${command.name} ${command.usage}\``;
      }
      return message.channel.send(reply);
    }
  
    // Execute requested command
    try {
    	command.execute(message, args);
    } catch (error) {
    	console.error(error);
      message.reply('```' + JSON.stringify(error) + '```');
    }
    
  });
  
  client.on('guildMemberAdd', handleGuildMemberAdd);
  
  const { accessToken } = await getSecretValue('ORLBot/Discord');

  client.login(accessToken);  
  
})();