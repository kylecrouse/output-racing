const puppeteer = require('puppeteer');
const { getLeagueSessions, getLatestResults, getSeriesResults } = require('./results');
const { getDrivers, getDriverId, inviteDriver, removeDriver, updateDriver } = require('./drivers');
const { getCareerStats, getSeasonStandings } = require('./stats');
const { send } = require('./pm');

class iRacing {
  constructor() {
    this.browser = null;
  }
  
  async init() {
    if (!this.browser) {
      if (process.env.NODE_ENV === 'production')
        this.browser = await puppeteer.launch({ 
          executablePath: '/usr/bin/google-chrome-stable', 
          headless: true, 
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      else
      	this.browser = await puppeteer.launch({
          executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        });
    }
  }
  
  async get(fn, ...args) {
    if (!this.browser) await this.init();
    const page = await this.browser.newPage();
    return fn(...args, page).then(res => page.close() && res);
  }
  
  getLeagueSessions(league_id) {
    return this.get(getLeagueSessions, league_id);
  }
  
  getLatestResults(league_id) {
    return this.get(getLatestResults, league_id);
  }
  
  getSeriesResults(seasonid, raceweek) {
    return this.get(getSeriesResults, seasonid, raceweek);
  }
  
  getDrivers(league_id) {
    return this.get(getDrivers, league_id);
  }
  
  getDriverId(name) {
    return this.get(getDriverId, name);
  }

  getCareerStats(custid) {
    return this.get(getCareerStats, custid);
  }
  
  getSeasonStandings(seasonid, carclassid, custid) {
    return this.get(getSeasonStandings, seasonid, carclassid, custid);
  }
  
  inviteDriver(custid, leagueid) {
    return this.get(inviteDriver, custid, leagueid);
  }

  removeDriver(custid, league_id) {
    return this.get(removeDriver, custid, league_id);
  }
  
  pmDriver(custid, message) {
    return this.get(send, custid, message);
  }
  
  updateDriver(propName, propValue, memberID, leagueID) {
    return this.get(updateDriver, propName, propValue, memberID, leagueID);
  }
}

module.exports = new iRacing();