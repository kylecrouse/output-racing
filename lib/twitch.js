const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');
const { EventSubListener, EnvPortAdapter } = require('twitch-eventsub');
const { getSecretValue } = require('../lib/secrets');

async function getStreams(names, handler) {
  
  const { clientId, clientSecret, secret } = await getSecretValue('ORLBot/Twitch');
  
  const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
  const client = new ApiClient({ authProvider });
  
  const listener = new EventSubListener(
    client, 
    new EnvPortAdapter({ hostName: 'bot.outputracing.com' }), 
    secret
  );
  
  await listener.listen();
  
  const users = await client.helix.users.getUsersByNames(names);
  
  let streamers = new Map();
  
  for (user of users) {
    await listener.subscribeToStreamOnlineEvents(user.id, e => {
    	console.log(`${e.broadcasterDisplayName} just went live!`);
      streamers.set(user.name, { online: true });
      handler.apply(null, streamers);
    });

    await listener.subscribeToStreamOfflineEvents(userId, e => {
    	console.log(`${e.broadcasterDisplayName} just went offline`);
      streamers.set(user.name, { online: false });
      handler.apply(null, streamers);
    });

    streamers.set(user.name, { ...user, online: !!(await streamer.getStream()) });
  }
  
  return handler.apply(null, streamers);
  
}

module.exports = { getStreams };