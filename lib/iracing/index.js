const puppeteer = require('puppeteer');
const { getLatestResults } = require('./results');
const { getDrivers, getDriverId, inviteDriver, removeDriver, updateDriver } = require('./drivers');
const { getCareerStats } = require('./stats');
const { send } = require('./pm');

class iRacing {
  constructor() {
    this.browser = null;
  }
  
  async init() {
    if (!this.browser) {
    	this.browser = await puppeteer.launch({ 
    		executablePath: '/usr/bin/google-chrome-stable', 
    		headless: true, 
    		args: ['--no-sandbox', '--disable-setuid-sandbox']
    	});
    	// this.browser = await puppeteer.launch();
    }
  }
  
  async get(fn, ...args) {
    if (!this.browser) await this.init();
    const page = await this.browser.newPage();
    return fn(...args, page).then(res => page.close() && res);
  }
  
  getLatestResults(league_id) {
    return this.get(getLatestResults, league_id);
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