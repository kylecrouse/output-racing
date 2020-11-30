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

const discordToken = process.env.DISCORD_ACCESS_TOKEN;

const cms = contentful.createClient({ accessToken: process.env.CONTENTFUL_ACCESS_TOKEN });
  
discord.on('ready', () => {
  console.log(`Logged in as ${discord.user.tag}!`);
});

discord.on('message', async (message) => {
  // console.log(message);
  
  // If bot is mentioned, interpret and handle the message.
  // Ignore DMs to ensure guild permissions available
  if (message.mentions.has(discord.user) && msg.guild) {
  
    // Don't do anything if the guild member isn't an administrator (or the dev's user)
    if (!msg.member.hasPermission('ADMINISTRATOR') && msg.member.user.id !== '697817102534311996') {
      return msg.react('🙅‍♀️');
    }
    
    console.log('Mention received!');
    
    // Set a flag for whether deployment is needed
    let didUpdateEntries = false;
  
    try {

      // Handle attachments on cross-posted message
      if (message.reference) {
        // Fetch the cross-posted message
        const crossPost = await message.channel.messages.fetch(message.reference.messageID);

        // Handle cross-posted attachments
        if (crossPost.attachments.size > 0) {
          console.log("Adding cross-posted attachments...");
          await mapAttachmentsToEntries(message.content, crossPost.attachments);
          didUpdateEntries = true;
        }

        // Handle embeds on cross-posted message
        if (crossPost.embeds.length > 0) {        
          console.log("Adding cross-posted embeds...");
          await mapEmbedsToEntries(message.content, crossPost.embeds);
          didUpdateEntries = true;
        } 
  
      }

      // Handle attachments on message
      if (message.attachments.size > 0) {        
        console.log("Adding attachments...");
        await mapAttachmentsToEntries(message.content, message.attachments);
        didUpdateEntries = true;
      } 
      
      // Handle embeds on message
      if (message.embeds.length > 0) {        
        console.log("Adding embeds...");
        await mapEmbedsToEntries(message.content, message.embeds);
        didUpdateEntries = true;
      } 
      
      // Handle upload actions
      if (message.content.indexOf('!upload') >= 0) {
        //TODO: Parse for hashtags to allow specific races, but for now
        //      treat everything as "#latest"
        console.log("Uploading latest race results...");
        await uploadLatestResults();
        didUpdateEntries = true;
      }

      // If something got updated, build & deploy
      if (didUpdateEntries) {
        console.log("Building and deploying website...");
        await deploy();
        message.react('👍');
        console.log("Done.");
      }
      // Just sayin' hi!   
      else {
        message.react('👋');
      }

    } catch(err) {
      console.log(err);
      message.react('🤷‍♀️');
    }
  }
});

discord.login(discordToken);

async function mapAttachmentsToEntries(content, attachments) {
  //TODO: How do we distinguish between attachment types and where they save to?
  const assets = await uploadAttachments(attachments); 
  return mapFieldsToEntries(
    content, 
    { media: { 'en-US': assets.map(asset => link(asset.sys.id))  }}
  );
}

function mapEmbedsToEntries(content, embeds) {
  return mapFieldsToEntries(
    content,
    { broadcast: embeds
        // Only handle links to YouTube for now
        .filter(({ video, url }) => video && url.match(/^https:\/\/www.youtube.com\//))
        .map(({ url }) => localize(`https://www.youtube.com/embed/${url.match(/v=(\w+)&/)[1]}`))
        .shift()
    }
  );
}

function mapFieldsToEntries(content, fields) {
  return Promise.all(getHashtags(content).map(async (hashtag) => {
    const entry = await getEntryForHashtag(hashtag);
    if (entry) await updateEntry(entry, fields);
    else throw new Error(`Couln't match ${hashtag}`);
  }));
}

async function getEntryForHashtag(hashtag) {
  let entry = null;
  switch(hashtag) {
    case "profile":
      // Find user and attach to profile
    break;
    case "logo":
      // Find next race and associate logo
    break;
    case "latest":
      // Find latest race and associate asset
      entry = await getLastRace();
    break;
    default:
      // Query track names matching hashtag
      entry = await getEntryByTrackName(hashtag);
    break;
  }
  return entry;
}

async function uploadAttachments(attachments) {
  let promises = [];
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
  return await asset.processForAllLocales().then(asset => asset.publish());
}

async function getEntries(params) {
	const space = await cms.getSpace(process.env.CONTENTFUL_SPACE_ID);
	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID);
  return await environment.getEntries(params);
}

function updateEntry(entry, fields) {
  // Loop through provided fields
  for (const [key, val] of Object.entries(fields)) {
    // If the field is an existing array, merge them together
    if (fieldIsArray(entry, key)) entry.fields[key] = mergeArrayFields(entry, key, val);
    // Otherwise set the field to the new value
    else entry.fields[key] = val;
  }
  // Update and publish the entry
  console.log(entry.fields);
  return entry.update().then(entry => entry.publish());
}

function fieldExists(entry, key) {
  return entry.fields[key];
}

function fieldIsArray(entry, key) {
  return fieldExists(entry, key) && Array.isArray(entry.fields[key]['en-US']);
}

function mergeArrayFields(entry, field, value) {
  return localize(entry.fields[field]['en-US'].concat(value['en-US']));
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

function getHashtags(message) {
  return message.split(' ')
    .filter(text => text.substr(0,1) === '#')
    .map(hashtag => hashtag.substr(1));
}

function uploadLatestResults() {
  return exec('yarn upload');
}

function link(id) {
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
  await exec('yarn export');
  return s3.uploadDirectory({ path: './out' });
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

const port = process.env.PORT || 3000;
// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);
// Put a friendly message on the terminal
console.log('Health check server running at http://127.0.0.1:' + port + '/');
