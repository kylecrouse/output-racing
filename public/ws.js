var ws = new WebSocket('ws://orldiscordbot-env.eba-zhcidp9s.us-west-2.elasticbeanstalk.com:8080');

ws.onopen = function (event) {
  ws.send("Here's some text that the server is urgently awaiting!");
};

ws.onmessage = function (event) {
  console.log(event.data);
}