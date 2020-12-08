const puppeteer = require('puppeteer');
const { getLatestResults } = require('./results');
const { getDrivers } = require('./drivers');

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
}

module.exports = new iRacing();