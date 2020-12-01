const http = require('http');
const Discord = require('discord.js');
const discord = new Discord.Client();
const contentful = require('contentful-management');
const mime = require('mime-types');
const fetch = require('node-fetch');
const moment = require('moment');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const s3 = require('./s3');
const puppeteer = require('puppeteer');

const discordToken = process.env.DISCORD_ACCESS_TOKEN;

const cms = contentful.createClient({ accessToken: process.env.CONTENTFUL_ACCESS_TOKEN });
  
discord.on('ready', () => {
  console.log(`Logged in as ${discord.user.tag}!`);
});

discord.on('message', async (message) => {
  // console.log(message);
  
  // If bot is mentioned, interpret and handle the message.
  // Ignore DMs to ensure guild permissions available
  if (!message.mentions.everyone && message.mentions.has(discord.user) && message.guild) {
  
    // Don't do anything if the guild member isn't an administrator (or the dev's user)
    if (!message.member.hasPermission('ADMINISTRATOR') && message.member.id !== '697817102534311996') {
      return message.react('🙅‍♀️');
    }
    
    console.log('Mention received!');
    
    try {
      
      // Resolve entry to update
      const entry = await getEntryFromMessage(message);
      
      // Handle entry-based actions
      if (entry) {
        
        // Set a placeholder for new field data
        let fields = {};

        // Fetch cross-posted message, if present
        const crossPost = message.reference 
          ? await message.channel.messages.fetch(message.reference.messageID)
          : null;

        // Handle attachments on message
        if (message.attachments.size > 0 || (crossPost && crossPost.attachments.size > 0)) {
          fields[isTagged(message.content, 'logo') ? 'logo' : 'media'] = await prepareAttachments(
            (crossPost && crossPost.attachments) || message.attachments
          );
        }
        
        // Handle embeds on message
        if (message.embeds.length > 0 || (crossPost && crossPost.embeds.length > 0)) {
          fields['broadcast'] = prepareEmbeds((crossPost && crossPost.embeds) || message.embeds);
        } 
        
        // If something wants to be updated, build & deploy
        if (Object.keys(fields).length > 0) {
          console.log("Updating content entries...");
          await updateEntry(entry, fields);
          
          console.log("Building and deploying website...");
          await deploy();
          
          console.log("Done.");
          message.react('👍');
        }
        else throw new Error(`Couldn't resolve message: "${message.content}"`);
        
      }
      
      // Handle non entry-based actions
      else {
        
        // Handle health check action
        if (message.content.indexOf('!health') >= 0) {
          console.log("Running puppeteer health check...");
          const response = await puppeteerHealthCheck();

          console.log("Done.");
          if (response.ok()) message.react('👍');
          else message.reply(await response.text());
        }
        
        // Handle upload actions
        else if (message.content.indexOf('!upload') >= 0) {
          //TODO: Parse for hashtags to allow specific races, but for now
          //      treat everything as "#latest"
          console.log("Uploading latest race results...");
          await uploadLatestResults();

          console.log("Building and deploying website...");
          await deploy();
          
          console.log("Done.");
          message.react('👍');
        }
        
        // Handle register actions
        else if (message.content.indexOf('!link') >= 0) {
          // Get hashtag in format #60
          const [number] = getHashtags(message.content);
          // Find driver matching current car number
          const drivers = await getEntries({ content_type: 'driver', 'fields.number[match]': number });
          // Set discordId for matched driver
          drivers.items[0].fields.discordId = { 'en-US': message.member.id };
          // Update record
          await drivers.items[0].update().then(entry => entry.publish());          
          console.log("Done.");
          message.react('👍');
        }
        
        // Just sayin' hi!   
        else {
          message.react('👋');
        }

      }

    } catch(err) {
      console.log(err);
      message.react('🤷‍♀️');
    }
  }
});

discord.login(discordToken);

async function prepareAttachments(attachments) {
  console.log("Adding attachments...");
  const assets = await uploadAttachments(attachments);
  return assets.map(asset => linkAsset(asset.sys.id));
}

function prepareEmbeds(embeds) {
  console.log("Adding embeds...");
  // Only handle links to YouTube for now
  return embeds
    .filter(({ video, url }) => video && url.match(/^https:\/\/www.youtube.com\//))
    .map(({ url }) => localize(`https://www.youtube.com/embed/${url.match(/v=(\w+)&/)[1]}`))
    .shift();
}

function getEntryFromMessage(message) {
  const hashtags = getHashtags(message.content);
  let entry = null;
  
  // Resolve the entry to update
  for (var i = hashtags.length; i--;) {
    const hashtag = hashtags[i];
    if (hashtag === 'me') {
      entry = getEntryByMember(message.member); 
    }
    else if (hashtag === 'logo') {
      // This is a field-level hashtag. Ignore.
    }
    else if (hashtag === 'latest') {
      entry = getLastRace();
    }
    else {
      entry = getEntryByTrackName(hashtag);
    }
  }
  
  return entry;
}

function isTagged(string, tag) {
  const hashtags = getHashtags(string);
  return hashtags.indexOf(tag) >= 0;
}
  
async function uploadAttachments(attachments) {
  let promises = [];
  // Use forEach->push instead of map because attachments is a Map, not an Array
  attachments.forEach(attachment => promises.push(uploadFile(attachment)));
  return await Promise.all(promises);
}

async function uploadFile(attachment) {
	const space = await cms.getSpace(process.env.CONTENTFUL_SPACE_ID);
	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID);
  const asset = await environment.createAssetFromFiles({
    fields: {
      title: { 'en-US': attachment.name },
      file: {
        'en-US': {
          contentType: mime.lookup(attachment.url),
          fileName: attachment.name,
          file: await fetch(attachment.url).then(res => res.buffer())
        }
      }
    }
  });
  return asset.processForAllLocales().then(asset => asset.publish());
}

async function getEntries(params) {
	const space = await cms.getSpace(process.env.CONTENTFUL_SPACE_ID);
	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID);
  return environment.getEntries(params);
}

function updateEntry(entry, fields) {
  // Loop through provided fields
  for (const [key, val] of Object.entries(fields)) {
    // If the field is an existing array, merge them together
    if (fieldIsArray(entry, key)) entry.fields[key] = { 'en-US': mergeArrayFields(entry, key, val) };
    // Otherwise set the field to the new value
    else entry.fields[key] = { 'en-US': val };
  }
  // Update and publish the entry
  return entry.update().then(entry => entry.publish());
}

function fieldExists(entry, key) {
  return entry.fields[key];
}

function fieldIsArray(entry, key) {
  return fieldExists(entry, key) && Array.isArray(entry.fields[key]['en-US']);
}

function mergeArrayFields(entry, field, value) {
  return entry.fields[field]['en-US'].concat(value);
}

async function getLastRace() {
  const entries = await getEntries({ content_type: 'race', limit: 500 });
  const races = entries.items
    .filter(race => moment().isSameOrAfter(race.fields.date['en-US'], 'day'))
    .sort((a, b) => moment(a.fields.date['en-US']).diff(b.fields.date['en-US']));
  return races.pop();
}

async function getEntryByTrackName(query) {
  const entries = await getEntries({ content_type: 'race', limit: 500 });
  const races = entries.items
    .filter(race => moment().isSameOrAfter(race.fields.date['en-US'], 'day') && race.fields.track['en-US'].indexOf(query) >= 0)
    .sort((a, b) => moment(a.fields.date['en-US']).diff(b.fields.date['en-US']));
  return races.pop();
}

async function getEntryByMember(member) {
  const entries = await getEntries({ content_type: 'driver', 'fields.discordId[match]': member.id });
  return entries.items[0];
}

function getHashtags(message) {
  return message.split(' ')
    .filter(text => text.substr(0,1) === '#')
    .map(hashtag => hashtag.substr(1));
}

function uploadLatestResults() {
  return exec('npm run upload');
}

function linkAsset(id) {
  return { sys: { type: "Link", linkType: "Asset", id }}
}

function localize(val) {
  if (typeof val === 'object') {
    for (key in val)
      val[key] = { 'en-US' : val[key] }
  } else {
    val = { 'en-US': val }
  }
  return val
}

async function deploy() {
  await exec('npm run build');
  return exec('aws s3 sync ./out s3://output-racing/');
  // return process.env.NODE_ENV === 'production'
  //   ? exec('aws s3 sync ./out s3://output-racing/')
  //   : s3.uploadDirectory({ path: './out' });
}

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

async function puppeteerHealthCheck() {
	const browser = await puppeteer.launch({ 
		executablePath: '/usr/bin/google-chrome-stable', 
		headless: true, 
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});
	const page = await browser.newPage();
	const [response] = await Promise.all([
		page.waitForResponse(response => response.ok()),
		page.goto(`http://127.0.0.1:${port}/`)
	])
	return response;
}