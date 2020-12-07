const puppeteer = require('puppeteer');
const { getResults, putResults } = require('./results');
const { getStats } = require('./stats');
const { getStandings } = require('./standings');

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
  
  async getStandings(season_id) {
    if (!this.page) await this.init();
    return getStandings(season_id, this.page);
  }

  async getLeagueStats(league_id) {
    if (!this.page) await this.init();
    return getStats('league_id', league_id, this.page);
  }
  
  async getSeasonStats(season_id) {
    if (!this.page) await this.init();
    return getStats('season_id', season_id, this.page);
  }
  
  async putResults(schedule_id) {
    
  }
}

module.exports = new DanLisa();