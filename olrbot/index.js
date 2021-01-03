const fs = require('fs');
const discord = require('discord.js');
const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');
const handleGuildMemberAdd = require('./handlers/guildMemberAdd');
const { handleApplication } = require('./lib/applications');
const { prefix, superUsers } = require('./config.json');

const client = new discord.Client();

// Set all recognized commands for bot from ./command/*.js
client.commands = new discord.Collection();
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
  const regex = /[^\s"]+|"([^"]*)"/gi;
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

client.login(process.env.DISCORD_ACCESS_TOKEN);

let connections = [];
const server = http.createServer((req, res) => {
  const headers = {
    "Access-Control-Allow-Origin": 'http://192.168.7.131',
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
        
      if (req.url === '/session') 
        connections.forEach(ws => ws.send(body));

      res.writeHead(200, 'OK', {...headers, 'Content-Type': 'text/plain'});
      res.end();
    });
  } else {
    res.writeHead(200, 'OK', {...headers, 'Content-Type': 'text/plain'});
    res.end();
  }
});

server.on('upgrade', function (req, socket) {
  if (req.headers['upgrade'] !== 'websocket') {
    socket.end('HTTP/1.1 400 Bad Request');
    return;
  }
  // Read the websocket key provided by the client: 
  const acceptKey = req.headers['sec-websocket-key']; 
  // Generate the response value to use in the response: 
  const hash = generateAcceptValue(acceptKey); 
  // Write the HTTP response into an array of response lines: 
  const responseHeaders = [ 'HTTP/1.1 101 Web Socket Protocol Handshake', 'Upgrade: WebSocket', 'Connection: Upgrade', `Sec-WebSocket-Accept: ${hash}` ]; 
  // Write the response back to the client socket, being sure to append two 
  // additional newlines so that the browser recognises the end of the response 
  // header and doesn't continue to wait for more header data: 
  socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');
});

const port = process.env.PORT || 3001;
// Listen on port 3001, IP defaults to 127.0.0.1
server.listen(port);

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  connections.push(ws);
  
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  
  ws.on('close', function close() {
    connections.splice(connections.indexOf(ws), 1);
  });

  ws.send('Hello, World!');
});

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');

// Don't forget the hashing function described earlier:
function generateAcceptValue (acceptKey) {
  return crypto
  .createHash('sha1')
  .update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
  .digest('base64');
}