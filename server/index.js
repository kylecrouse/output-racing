const http = require('http');
const express = require('express');
const app = express();
const WebSocket = require('express-ws')(app);
const cors = require('cors');
const bodyParser = require('body-parser');
const { getSecretValue } = require('../lib/secrets');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');
const { EventSubListener, MiddlewareAdapter } = require('twitch-eventsub');
const league = require('../lib/league');
const { handleApplication } = require('../bot/lib/applications');

(async () => {
  
  const { clientId, clientSecret, secret } = await getSecretValue('ORLBot/Twitch');
  
  const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
  const apiClient = new ApiClient({ authProvider });
  
  const listener = new EventSubListener(
    apiClient, 
    new MiddlewareAdapter({ 
      hostName: 'bot.outputracing.com', 
      pathPrefix: '/twitch',
      port: process.env.PORT || 3001
    }), 
    secret
  );
  
  // Create data cache for received messages (need to purge at some point)
  let cache = {
    session: {}, 
    streamers: new Map()
  }; 
  
  await league.init();
  
  // Resolve Twitch users from league drivers' usernames
  const users = await apiClient.helix.users.getUsersByNames(
    ['aussie_sim_commentator'].concat(league.streamers)
      .reduce((streamers, streamer) => {
        if (streamer.sys) {
          const driver = league.drivers.find(driver => driver.id === streamer.sys.id);
          if (driver.active && driver.twitchUserLogin)
            streamers.push(driver.twitchUserLogin);
        }
        else
          streamers.push(streamer);
        return streamers;
      }, [])
  );

  for (user of users) {
    cache.streamers.set(user.name, { id: user.id, name: user.name, online: !!(await user.getStream()) });
    
    await listener.subscribeToStreamOnlineEvents(user.id, e => {
    	console.log(`${e.broadcasterDisplayName} just went live!`);
      cache.streamers.set(user.name, { online: true });

      // Broadcast updated data to all clients
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN)
          client.send(JSON.stringify(cache.streamers, replacer));
      });
    });

    await listener.subscribeToStreamOfflineEvents(user.id, e => {
    	console.log(`${e.broadcasterDisplayName} just went offline`);
      cache.streamers.set(user.name, { online: false });

      // Broadcast updated data to all clients
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN)
          client.send(JSON.stringify(cache.streamers, replacer));
      });
    });
  }
  
  const options = {
    origin: ['http://localhost:3000', 'https://outputracing.com']
  };
  
  app.options('/raceday', cors(options));
  
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
    try {
      // console.log(req.body);
      const data = JSON.parse(req.body[req.body.type]);
      console.log('111', typeof data, data.sname === 'TESTING');
      if (data.sname === 'TESTING') {
        // Get next race matching track from cache
        const race = league.getNextRace({ track: data.trackname });
        console.log('222', data.trackname, race);
        if (race) {
          const d = data.d['0'];
          // Get matching driver
          const driver = league.drivers.find(({ name }) => name === d.name);
          console.log('333', data.d['0'], driver);
          if (driver) {
            // Get testing data for matching driver
            const record = race.testing[driver.id];
            // New best lap set?
            console.log('444', race.testing, record, d.b);
            if (!record || (record && d.b >= record.best.lap)) {
              // Put testing data with new record
              race.put({ testing: { 
                ...race.testing, 
                [driver.id]: {
                  ...race.testing[driver.id],
                  best: {
                    date: data.date,
                    skies: data.skies,
                    tracktemp: (data.tracktemp * (9/5) + 32).toFixed(0),
                    lap: d.b,
                  }
                }
              }});
            }
          }
        }
      }
      res.send('OK');
    } catch(err) {
      console.log(err);
      res.send('OK');
    }
  });
  
  app.post('/tpost_img.php', bodyParser.raw(), (req, res) => {
    console.log(req.body);
    res.send('OK');
  });
  
  app.ws('/raceday', (ws, req) => {

    // Send cached data to newly connected clients
    ws.send(JSON.stringify(cache, replacer));

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
  
  listener.applyMiddleware(app);
  
  app.listen(process.env.PORT || 3001, () => {
    console.log(`Server running at http://127.0.0.1:${process.env.PORT || 3001}/`);
  });
  
})();

function replacer(key, value) {
  if (value instanceof Map)
    return { dataType: 'Map', value: [...value] };
  else
    return value;
}