const fetch = require('node-fetch');

module.exports = async (url, session) => {
  // Make sure there is a browser session
  if (!session) return;
  
  // Intercept requests to allow download of .CSV files
  await session.setRequestInterception(true);

  // Create intercept listener that downloads .CSV file
	const request = new Promise(resolve => {
    session.on('request', req => {
      if (req.resourceType() === 'document' && req.url().substr(-4) === '.csv') {
        resolve(fetch(req._url, {
          encoding: null,
          method: req._method,
          headers: req._headers
        }));
      }
      req.continue();
    });
  });

  // TODO: build an error handler for non-200 responses
  await session.goto(url);

  const response = await request;
  return response.text();
};