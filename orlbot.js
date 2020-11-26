const Discord = require('discord.js');
const discord = new Discord.Client();
const contentful = require('contentful-management');
const mime = require('mime-types');
const fetch = require('node-fetch');
const moment = require('moment');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const s3 = require('./build/s3');

const discordToken = process.env.DISCORD_ACCESS_TOKEN;

const cms = contentful.createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});
  
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
      }

      // Handle attachments on message
      if (message.attachments.size > 0) {        
        console.log("Adding attachments...");
        await mapAttachmentsToEntries(message.content, message.attachments);
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
  const assets = await uploadAttachments(attachments); 
  return Promise.all(getHashtags(content).map(async (hashtag) => {
    const entry = await getEntryForHashtag(hashtag);
    if (entry) await updateEntryWithAssets(entry, assets);
    else throw new Error(`Couldn't match ${hashtag}.`);
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
  const space = await cms.getSpace('38idy44jf6uy');
  const environment = await space.getEnvironment('master');
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
  const space = await cms.getSpace('38idy44jf6uy');
  const environment = await space.getEnvironment('master');
  return await environment.getEntries(params);
}

function updateEntryWithAssets(entry, assets) {
  const media = entry.fields.media || { 'en-US': [] };
  entry.fields.media = { 'en-US': media['en-US'].concat(assets.map(asset => link(asset.sys.id))) };
  return entry.update().then(entry => entry.publish());
}

async function getLastRace() {
  const entries = await getEntries({ content_type: 'race' });
  const races = entries.items
    .filter(race => moment().isSameOrAfter(race.fields.date['en-US'], 'day'))
    .sort((a, b) => moment(a.fields.date['en-US']).diff(b.fields.date['en-US']));
  return races.pop();
}

async function getEntryByTrackName(query) {
  const entries = await getEntries({ content_type: 'race' });
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

function link(id) {
  return { sys: { type: "Link", linkType: "Asset", id }}
}

async function deploy() {
  await exec('yarn export');
  return s3.uploadDirectory({ path: './out' });
}