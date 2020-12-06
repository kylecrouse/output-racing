const fs = require('fs');
const discord = require('discord.js');
const http = require('http');
const { prefix, superUsers } = require('./config.json');

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
  console.log(message);
  
  // Exit if there is no command or message is from a bot.
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  
  // Only handle guild messages or DMs from allowed users
  if (!(message.guild || superUsers.includes(message.author.id))) return;
    
  // Get message command (i.e., !command) and args
  const args = message.content.slice(prefix.length).trim().split(/[^\s"]+|"([^"]*)"/gi);
  const commandName = args.shift().toLowerCase();

  // If the command is not recognized, exit.  
  if (!client.commands.has(commandName)) return;
  
  // Get the requested command
  const command = client.commands.get(commandName);
  
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
  	message.react('🤷‍♀️');
  }
  
});

client.login(process.env.DISCORD_ACCESS_TOKEN);

  
  // // If bot is mentioned, interpret and handle the message.
  // // Ignore DMs to ensure guild permissions available
  // if (!message.mentions.everyone && message.mentions.has(discord.user) && message.guild) {
  // 
  //   console.log('Mention received!');
  //   
  //   try {
  //     
  //     // Only let admins run important things
  //     if (message.member.hasPermission('ADMINISTRATOR') || message.member.id === '697817102534311996') {
  //   
  //       // Resolve entry to update
  //       const entry = await getEntryFromMessage(message);
  //       
  //       // Handle entry-based actions
  //       if (entry) {
  //         
  //         // Set a placeholder for new field data
  //         let fields = {};
  // 
  //         // Fetch cross-posted message, if present
  //         const crossPost = message.reference 
  //           ? await message.channel.messages.fetch(message.reference.messageID)
  //           : null;
  // 
  //         // Handle attachments on message
  //         if (message.attachments.size > 0 || (crossPost && crossPost.attachments.size > 0)) {
  //           fields[isTagged(message.content, 'logo') ? 'logo' : 'media'] = await prepareAttachments(
  //             (crossPost && crossPost.attachments) || message.attachments
  //           );
  //         }
  //         
  //         // Handle embeds on message
  //         if (message.embeds.length > 0 || (crossPost && crossPost.embeds.length > 0)) {
  //           fields['broadcast'] = prepareEmbeds((crossPost && crossPost.embeds) || message.embeds);
  //         } 
  //         
  //         // If something wants to be updated, build & deploy
  //         if (Object.keys(fields).length > 0) {
  //           console.log("Updating content entries...");
  //           await updateEntry(entry, fields);
  //           
  //           console.log("Building and deploying website...");
  //           await deploy();
  //           
  //           console.log("Done.");
  //           message.react('👍');
  //         }
  //         else throw new Error(`Couldn't resolve message: "${message.content}"`);
  //         
  //       }
  //       
  //       // Handle non entry-based actions
  //       else {
  //         
  //         // Handle health check action
  //         if (message.content.indexOf('!health') >= 0) {
  //           console.log("Running puppeteer health check...");
  //           const response = await puppeteerHealthCheck();
  // 
  //           console.log("Done.");
  //           if (response.ok()) message.react('👍');
  //           else message.reply(await response.text());
  //         }
  //         
  //         // Handle upload actions
  //         else if (message.content.indexOf('!upload') >= 0) {
  //           //TODO: Parse for hashtags to allow specific races, but for now
  //           //      treat everything as "#latest"
  //           console.log("Uploading latest race results...");
  //           await uploadLatestResults();
  // 
  //           console.log("Building and deploying website...");
  //           await deploy();
  //           
  //           console.log("Done.");
  //           message.react('👍');
  //         }
  //                   
  //         // Just sayin' hi!   
  //         else {
  //           message.react('👋');
  //         }
  // 
  //       }
  //       
  //     }
  //     
  //     // Actions that anyone can run
  //     else {
  //       
  //       // Handle register actions
  //       if (message.content.indexOf('!link') >= 0) {
  //         // Get hashtag in format #60
  //         const [number] = getHashtags(message.content);
  //         // Find driver matching current car number
  //         const drivers = await getEntries({ content_type: 'driver', 'fields.number': number });
  //         // Set discordId for matched driver
  //         drivers.items[0].fields.discordId = { 'en-US': message.member.id };
  //         // Update record
  //         await drivers.items[0].update().then(entry => entry.publish());          
  //         console.log("Done.");
  //         message.react('👍');
  //       }
  //       
  //       // Repost driver profile uploads to admin channel for moderation
  //       else if (isTagged(message.content, 'me')) {
  //         
  //         // const embed = new Discord.MessageEmbed()
	//         //   .setColor('#f4a913')
  //         // 	.setAuthor(message.member.displayName, message.member.user.defaultAvatarURL)
  //         // 	.setDescription('Please approve my profile image')
  //         // 	.setImage('https://i.imgur.com/wSTFkRM.png')
  //         // 	.setTimestamp()
  //         // 	.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
  //           
  //       }
  //       
  //       // Just sayin' hi!   
  //       else {
  //         message.react('👋');
  //       }
  //       
  //     }
// 
  //   } catch(err) {
  //     console.log(err);
  //     message.react('🤷‍♀️');
  //   }
  // }
// });

// function prepareEmbeds(embeds) {
//   console.log("Adding embeds...");
//   // Only handle links to YouTube for now
//   return embeds
//     .filter(({ video, url }) => video && url.match(/^https:\/\/www.youtube.com\//))
//     .map(({ url }) => localize(`https://www.youtube.com/embed/${url.match(/v=(\w+)&/)[1]}`))
//     .shift();
// }
// 
// function getEntryFromMessage(message) {
//   const hashtags = getHashtags(message.content);
//   let entry = null;
//   
//   // Resolve the entry to update
//   for (var i = hashtags.length; i--;) {
//     const hashtag = hashtags[i];
//     if (hashtag === 'me') {
//       entry = getEntryByMember(message.member); 
//     }
//     else if (hashtag === 'logo') {
//       // This is a field-level hashtag. Ignore.
//     }
//     else if (hashtag === 'latest') {
//       entry = getLastRace();
//     }
//     else {
//       entry = getEntryByTrackName(hashtag);
//     }
//   }
//   
//   return entry;
// }
// 
// function isTagged(string, tag) {
//   const hashtags = getHashtags(string);
//   return hashtags.indexOf(tag) >= 0;
// }
//   
// async function getEntries(params) {
// 	const space = await cms.getSpace(process.env.CONTENTFUL_SPACE_ID);
// 	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID);
//   return environment.getEntries(params);
// }
// 
// function updateEntry(entry, fields) {
//   // Loop through provided fields
//   for (const [key, val] of Object.entries(fields)) {
//     // If the field is an existing array, merge them together
//     if (fieldIsArray(entry, key)) entry.fields[key] = { 'en-US': mergeArrayFields(entry, key, val) };
//     // Otherwise set the field to the new value
//     else entry.fields[key] = { 'en-US': val };
//   }
//   // Update and publish the entry
//   return entry.update().then(entry => entry.publish());
// }
// 
// function fieldExists(entry, key) {
//   return entry.fields[key];
// }
// 
// function fieldIsArray(entry, key) {
//   return fieldExists(entry, key) && Array.isArray(entry.fields[key]['en-US']);
// }
// 
// function mergeArrayFields(entry, field, value) {
//   return entry.fields[field]['en-US'].concat(value);
// }
// 
// async function getEntryByMember(member) {
//   const entries = await getEntries({ content_type: 'driver', 'fields.discordId[match]': member.id });
//   return entries.items[0];
// }
// 
// function getHashtags(message) {
//   return message.split(' ')
//     .filter(text => text.substr(0,1) === '#')
//     .map(hashtag => hashtag.substr(1));
// }
// 
// function uploadLatestResults() {
//   return new Promise((resolve, reject) => {
//     const childProcess = spawn('npm', ['upload']);
//     childProcess.stdout.on('data', (data) => { 
//       console.log(data.toString().replace(/\r?\n|\r/g, ''));
//     });
//     childProcess.stderr.on('data', (data) => { 
//       console.error(data.toString().replace(/\r?\n|\r/g, ''));
//     });
//     childProcess.on('close', (code) => {
// 			console.log('Closed upload results process.');
//       resolve();
//     });
//   });
//   // return exec('npm run upload');
// }
// 
// function linkAsset(id) {
//   return { sys: { type: "Link", linkType: "Asset", id }}
// }
// 
// function localize(val) {
//   if (typeof val === 'object') {
//     for (key in val)
//       val[key] = { 'en-US' : val[key] }
//   } else {
//     val = { 'en-US': val }
//   }
//   return val
// }
// 
// async function deploy() {
//   await exec('npm run build');
//   return exec('aws s3 sync ./out s3://output-racing/');
//   // return process.env.NODE_ENV === 'production'
//   //   ? exec('aws s3 sync ./out s3://output-racing/')
//   //   : s3.uploadDirectory({ path: './out' });
// }

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    var body = '';

    req.on('data', (chunk) => { body += chunk; });

    req.on('end', function() {
      if (req.url === '/') {
        // log('Received message: ' + body);
      } else if (req.url = '/scheduled') {
        // log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
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

// async function puppeteerHealthCheck() {
// 	const browser = await puppeteer.launch({ 
// 		executablePath: '/usr/bin/google-chrome-stable', 
// 		headless: true, 
// 		args: ['--no-sandbox', '--disable-setuid-sandbox']
// 	});
// 	const page = await browser.newPage();
// 	const [response] = await Promise.all([
// 		page.waitForResponse(response => response.ok()),
// 		page.goto(`http://127.0.0.1:${port}/`)
// 	])
// 	return response;
// }