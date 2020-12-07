const puppeteer = require('puppeteer');
const { getResults, putResults } = require('./results');
const { getSchedule } = require('./schedule');
const { getStats } = require('./stats');
const { getStandings } = require('./standings');

class DanLisa {
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
    if (!this.page) await this.init();
    const page = await this.browser.newPage();
    return fn(...args, page).then(res => page.close() && res);
  }
  
  getResults(race_id) {
    return this.get(getResults, race_id);
  }
  
  getSchedule(season_id) {
    return this.get(getSchedule, season_id);
  }
  
  getStandings(season_id) {
    return this.get(getStandings, season_id);
  }

  getLeagueStats(league_id) {
    return this.get(getStats, 'league_id', league_id);
  }
  
  getSeasonStats(season_id) {
    return this.get(getStats, 'season_id', season_id);
  }
  
  async putResults(schedule_id) {
    
  }
}

module.exports = new DanLisa();