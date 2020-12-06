const puppeteer = require('puppeteer');
const { getResults } = require('./results');

class DanLisa {
  constructor() {
    this.browser = null;
    this.page = null;
  }
  
  async init() {
    if (!this.browser) {
    	this.browser = await puppeteer.launch({ 
    		executablePath: '/usr/bin/google-chrome-stable', 
    		headless: true, 
    		args: ['--no-sandbox', '--disable-setuid-sandbox']
    	});
    	// this.browser = await puppeteer.launch();
      this.page = await this.browser.newPage();
    }
  }
  
  async getResults(race_id) {
    if (!this.page) await this.init();
    return getResults(race_id, this.page);
  }
}

module.exports = new DanLisa();