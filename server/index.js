const http = require('http');
const express = require('express');
const app = express();
const WebSocket = require('express-ws')(app);
const cors = require('cors');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const cleanup = require('node-cleanup');
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
      pathPrefix: '/twitch'
    }), 
    secret,
    { logger: { minLevel: 'debug' }}
  );
  
  // Create data cache for received messages (need to purge at some point)
  let cache = {
    session: {}, 
    streamers: new Map()
  }; 
  
  await league.init();
  
  // Generate cache of Twitch streamers and subscribe for updates
  const subscriptions = await Promise.map(
    // Resolve Twitch users from league drivers' usernames
    apiClient.helix.users.getUsersByNames(
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
    ),
    async (user) => {
      // Set cache with streamer's current status
      cache.streamers.set(user.name, !!(await user.getStream()));
      // Subscribe to stream online/offline events
      return Promise.all([
        listener.subscribeToStreamOnlineEvents(user.id, e => {
          cache.streamers.set(user.name, true);
          // Broadcast updated data to all clients
          broadcast(JSON.stringify(cache.streamers, replacer));
        }),
        listener.subscribeToStreamOfflineEvents(user.id, e => {
          cache.streamers.set(user.name, false);
          // Broadcast updated data to all clients
          broadcast(JSON.stringify(cache.streamers, replacer));
        })
      ]).catch(err => console.log('[ERROR]', 'subscriptions', err));
    }
  );
  
  let subs = await apiClient.helix.eventSub.getSubscriptionsPaginated().getAll(); 
  console.log('subscriptions', subs);
  
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
      if (req.body.type !== 'data') return res.send('OK');
      // console.log(req.body);
      const data = JSON.parse(req.body[req.body.type]);
      const d = data.d['0'];
      if (data.sname === 'TESTING' && d.b) {
        // Get next race matching track from cache
        const race = league.getNextRace({ track: data.trackname });
        if (race) {
          // Get matching driver
          const driver = league.drivers.find(({ name }) => name === d.name);
          if (driver) {
            if (race.testing) {
              // Get testing data for matching driver
              const record = race.testing[driver.id];
              // New best lap set?
              if (!record || (record && d.b < record.best.lap)) {
                // Put testing data with new record
                league.season.updateRace(race, { testing: { 
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
            } else {
              // Put testing data with new record
              league.season.updateRace(race, { testing: { 
                [driver.id]: {
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
      console.log('[ERROR]', '/telemetry', err);
      res.send('OK');
    }
  });
  
  app.post('/tpost_img.php', bodyParser.raw(), (req, res) => {
    console.log('/tpost_img.php', req.body);
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
        console.log('[ERROR]', '/raceday', err);
      }
      
      // Broadcast data to all clients (except self)
      broadcast(data);
    });
    
  });
  
  listener.applyMiddleware(app);
  
  app.listen(process.env.PORT || 3001, () => {
    console.log(`Server running at http://127.0.0.1:${process.env.PORT || 3001}/`);
  });
  
  // Unsubscribe listeners on exit
  cleanup(function unsubscribe(exitCode, signal) {
    console.log('Cleaning up...', { exitCode, signal, subscriptions });
    if (signal && Array.isArray(subscriptions)) {
      // Kill process after unsubscribing
      Promise.map(
        subscriptions
          .filter(sub => sub && typeof sub.stop == 'function')
          .flat(), // subscriptions = [[online, offline], ...]
        subscription => subscription.stop()
      ).then(() => {
        console.log('Exiting...');
        // Safely exit
        process.kill(process.pid, signal);
      });
      // Prevents cleanup handler from being called again
      cleanup.uninstall();
      // Prevent exit until cleanup
      return false;
    }
  });
  
})();

function broadcast(msg) {
  WebSocket.getWss().clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN)
      client.send(msg);
  });
}

function replacer(key, value) {
  if (value instanceof Map)
    return { dataType: 'Map', value: [...value] };
  else
    return value;
}