const fs = require('fs');
const Discord = require('discord.js');
const http = require('http');
const WebSocket = require('ws');
const handleGuildMemberAdd = require('./handlers/guildMemberAdd');
const { handleApplication } = require('./lib/applications');
const { prefix, superUsers } = require('./config.json');
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
    
    // Only handle guild messages or DMs from allowed users
    // if (!(message.guild || superUsers.includes(message.author.id))) return;
      
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


const server = http.createServer((req, res) => {
  const headers = {
    "Access-Control-Allow-Origin": '*',
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Allow-Headers": 'Content-Type',
    "Access-Control-Max-Age": 2592000
  };
	
  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    var body = '';

    req.on('data', (chunk) => { body += chunk; });

    req.on('end', async function() {
      if (req.url === '/apply')
        await handleApplication(client, JSON.parse(body));
        
      res.writeHead(200, 'OK', {...headers, 'Content-Type': 'text/plain'});
      res.end();
    });
  } else {
    res.writeHead(200, 'OK', {...headers, 'Content-Type': 'text/plain'});
    res.end();
  }
});

// Create data cache for received messages (need to purge at some point)
let cache = {};

// Create new socket server piggy-backing on http server
const wss = new WebSocket.Server({ 
  server,
  verifyClient: info => {
    console.log(info);
    return true;
  }
});

// Listen for new connections
wss.on('connection', function connection(ws) {
  
  // Send cached data to newly connected clients
  ws.send(JSON.stringify(cache));
  
  // Handle messages received from iRacing
  ws.on('message', function incoming(data) {
    
    // Update data cache
    try {
      const json = JSON.parse(data);
      if (json.SubSessionID !== undefined && json.SubSessionID !== cache.SubSessionID)
        cache = json;
      else 
        cache = { ...cache, ...json };
    } catch(err) {
      console.log(err);
    }
    
    // Broadcast data to all clients (except self)
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
  
});

const port = process.env.PORT || 3001;
// Listen on port 3001, IP defaults to 127.0.0.1
server.listen(port);
// Put a friendly message on the terminal
console.log('Health check server running at http://127.0.0.1:' + port + '/');
