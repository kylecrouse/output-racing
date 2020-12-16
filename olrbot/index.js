const fs = require('fs');
const discord = require('discord.js');
const http = require('http');
const iracing = require(`${process.cwd()}/lib/iracing`);
const { prefix, superUsers, websiteChannelId } = require('./config.json');

const client = new discord.Client();

// Set all recognized commands for bot from ./command/*.js
client.commands = new discord.Collection();
const commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.js'));
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
  if (!(message.guild || superUsers.includes(message.author.id))) return;
    
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

client.login(process.env.DISCORD_ACCESS_TOKEN);

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    var body = '';

    req.on('data', (chunk) => { body += chunk; });

    req.on('end', async function() {
      if (req.url === '/apply') {
        console.log('Received message: ' + body);
        await handleApplication(JSON.parse(body));
      }

      res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
      res.end();
    });
  } else {
    res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
    res.end();
  }
});

const port = process.env.PORT || 3001;
// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);
// Put a friendly message on the terminal
console.log('Health check server running at http://127.0.0.1:' + port + '/');

function handleApplication({ namedValues }) {
  try {
    const custId = await iracing.getDriverId(namedValues.Name[0]);
    const { license, stats = {} } = await iracing.getCareerStats(custId);
    const embed = new discord.MessageEmbed()
    	.setTitle('New Driver Application')
    	.setURL(`https://members.iracing.com/membersite/member/CareerStats.do?custid=${custId}`)
      .setDescription(`${namedValues.Name[0]} applied to the league.`)
      .addFields(
        Object.entries(namedValues).reduce((fields, [name, value]) => { 
          if (name !== "Name" && name !== "Email" && value[0])
            fields.push({ name, value: value[0] });
          return fields; 
        }, [])
      )
    	.addFields(
        { name: 'License', value: `\`${license.licGroupDisplayName}\``, inline: true },
        { name: 'SR', value: `\`${license.srPrime}.${license.srSub}\``, inline: true },
        { name: 'iRating', value: `\`${(parseInt(license.iRating)/1000).toFixed(1)}k\``, inline: true },
        { name: 'Starts', value: `\`${stats.starts}\``, inline: true },
        { name: 'Inc/Race', value: `\`${stats.avgIncPerRace.toFixed(2)}\``, inline: true },
        { name: 'Laps', value: `\`${stats.totalLaps}\``, inline: true },
        { name: 'Win %', value: `\`${stats.winPerc.toFixed(2)}%\``, inline: true },
        { name: 'Top 5%', value: `\`${stats.top5Perc.toFixed(2)}%\``, inline: true },
        { name: 'Led %', value: `\`${stats.lapsLedPerc.toFixed(2)}%\``, inline: true },
    	)
    	.setTimestamp()
      
    client.channels.cache.get('780928716728959047'/*websiteChannelId*/).send(embed);
    
  } catch(err) {
    console.log(err);
  }
}