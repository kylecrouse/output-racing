const http = require('http');
const WebSocket = require('ws');
const { getSecretValue } = require('../lib/secrets');
const { getStreams } = require('../lib/twitch');
const league = require('../lib/league');
const { handleApplication } = require('../bot/lib/applications');

const origins = ['http://localhost:3000', 'https://outputracing.com', 'https://script.google.com'];

const server = http.createServer((req, res) => {
  const headers = {
    "Access-Control-Allow-Origin": origins.includes(req.headers.origin) ? req.headers.origin : null,
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Allow-Headers": 'Content-Type',
    "Access-Control-Max-Age": 2592000
  };
	
  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    var body = '';

    req.on('data', (chunk) => { body += chunk; });

    req.on('end', async function() {
      try {
        if (req.url === '/apply')
          await handleApplication(JSON.parse(body));
        res.writeHead(200, 'OK', {...headers, 'Content-Type': 'text/plain'});
        res.end();
      } catch(error) {
        console.log(error);
        res.writeHead(500, 'ERROR', { 'Content-Type': 'text/plain' });
        res.end();
      }
    });
  } else {
    res.writeHead(200, 'OK', {...headers, 'Content-Type': 'text/plain'});
    res.end();
  }
});

(async () => {
  
  // Create new socket server piggy-backing on http server
  const wss = new WebSocket.Server({ 
    server,
    verifyClient: info => {
      // console.log(info);
      return true;
    }
  });
  
  await league.init();
  
  // Create data cache for received messages (need to purge at some point)
  let cache = { 
    session: {}, 
    streamers: []/*Array.isArray(league.streamers)
      ? await getStreams(
          league.streamers
            .filter(streamer => streamer.active && streamer.twitchUserLogin)
            .map(streamer => streamer.twitchUserLogin), 
          (streamers) => { 
            cache.streamers = streamers; 
    
            // Broadcast updated data to all clients
            wss.clients.forEach(function each(client) {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(streamers, replacer));
              }
            });
    
          }
        ) 
      : null*/
  };
  
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

})();

const port = process.env.PORT || 3001;
// Listen on port 3001, IP defaults to 127.0.0.1
server.listen(port);
// Put a friendly message on the terminal
console.log('Health check server running at http://127.0.0.1:' + port + '/');


function replacer(key, value) {
  if (value instanceof Map)
    return { dataType: 'Map', value: [...value] };
  else
    return value;
}