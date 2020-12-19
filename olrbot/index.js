const fs = require('fs');
const discord = require('discord.js');
const http = require('http');
const handleGuildMemberAdd = require('./handlers/guildMemberAdd');
const handleMessage = require('./handlers/message');
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
client.on('message', handleMessage);
client.on('guildMemberAdd', handleGuildMemberAdd);

client.login(process.env.DISCORD_ACCESS_TOKEN);

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    var body = '';

    req.on('data', (chunk) => { body += chunk; });

    req.on('end', async function() {
      if (req.url === '/apply')
        await handleApplication(client, JSON.parse(body));

      res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
      res.end();
    });
  } else {
    res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
    res.end();
  }
});

const port = process.env.PORT || 3001;
// Listen on port 3001, IP defaults to 127.0.0.1
server.listen(port);
// Put a friendly message on the terminal
console.log('Health check server running at http://127.0.0.1:' + port + '/');
