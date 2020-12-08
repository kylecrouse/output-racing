const { waitForAuthentication } = require('./auth');

module.exports = {
  getDrivers: async (league_id, page) => {

    await waitForAuthentication(page);
    
  }
}