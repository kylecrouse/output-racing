const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const { getSecretValue } = require('../lib/secrets');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');
const { EventSubListener, MiddlewareAdapter } = require('twitch-eventsub');
const league = require('../lib/league');
const { handleApplication } = require('../bot/lib/applications');

(async () => {
  
  const app = express();
  const options = {
    origin: ['http://localhost:3000', 'https://outputracing.com']
  };
  
  app.options('/', cors(options));
  
  app.get('/', (req, res) => {
    res.send('OK');
  });
  
  app.post('/apply', bodyParser.json(), async (req, res) => {
    try {
      await handleApplication(req.body);
      res.send('OK');
    } catch(err) {
      next(err);
    }
  });
  
  app.post('/telemetry', bodyParser.json(), (req, res) => {
    console.log(req.body);
    res.send('OK');
  });
  
  app.post('/tpost_img.php', bodyParser.raw(), (req, res) => {
    console.log(req.body);
    res.send('OK');
  });
  
  const { clientId, clientSecret, secret } = await getSecretValue('ORLBot/Twitch');
  
  const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
  const apiClient = new ApiClient({ authProvider });
  
  const listener = new EventSubListener(
    apiClient, 
    new MiddlewareAdapter({ hostName: 'bot.outputracing.com' }), 
    secret
  );
  
  listener.applyMiddleware(app);
  
  await listener.listen();

  // Create data cache for received messages (need to purge at some point)
  let cache = {
    session: {}, 
    streamers: new Map()
  }; 
  
  await league.init();
  
  if (Array.isArray(league.streamers)) {
    // Resolve Twitch users from league drivers' usernames
    const users = await apiClient.helix.users.getUsersByNames(
      league.streamers
        .map(streamer => league.drivers.find(driver => driver.id === streamer.sys.id))
        .filter(streamer => streamer.active && streamer.twitchUserLogin)
        .map(streamer => streamer.twitchUserLogin)
    );

    for (user of users) {
      cache.streamers.set(user.id, { id: user.id, name: user.name, online: !!(await user.getStream()) });
      
//       await listener.subscribeToStreamOnlineEvents(user.id, e => {
//       	console.log(`${e.broadcasterDisplayName} just went live!`);
//         cache.streamers.set(user.id, { online: true });
// 
//         // Broadcast updated data to all clients
//         wss.clients.forEach(function each(client) {
//           if (client.readyState === WebSocket.OPEN)
//             client.send(JSON.stringify(cache.streamers, replacer));
//         });
//       });
//   
//       await listener.subscribeToStreamOfflineEvents(userId, e => {
//       	console.log(`${e.broadcasterDisplayName} just went offline`);
//         cache.streamers.set(user.id, { online: false });
// 
//         // Broadcast updated data to all clients
//         wss.clients.forEach(function each(client) {
//           if (client.readyState === WebSocket.OPEN)
//             client.send(JSON.stringify(cache.streamers, replacer));
//         });
//       });
    }
    
  }
   
  const server = http.createServer(app);
  
  // Create new socket server piggy-backing on http server
  const wss = new WebSocket.Server({ server });
  
  // Listen for new connections
  wss.on('connection', function connection(ws) {
    
    // Send cached data to newly connected clients
    ws.send(JSON.stringify(cache.session));
    ws.send(JSON.stringify(cache.streamers, replacer));
    
    // Handle messages received from iRacing
    ws.on('message', function incoming(data) {
      
      // Update data cache
      try {
        const json = JSON.parse(data);
        if (json.SubSessionID !== undefined && json.SubSessionID !== cache.session.SubSessionID)
          cache.session = json;
        else 
          cache.session = { ...cache.session, ...json };
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

  server.listen(process.env.PORT || 3001, () => {
    console.log(`Server running at http://127.0.0.1:${server.address().port}/`);
  });

})();

function replacer(key, value) {
  if (value instanceof Map)
    return { dataType: 'Map', value: [...value] };
  else
    return value;
}