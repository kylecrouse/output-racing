const contentful = require('../contentful');
const Entry = require('../contentful/entry');
const Driver = require('../contentful/driver');
const Race = require('../contentful/race');
const Season = require('../contentful/season');
const moment = require('moment');

class League extends Entry {
  constructor(id = 1710) {
    super();
    this.id = id;
    this.season = {};
    this.drivers = [];
  }
  
  async init() {
    if (this.entry) return this;
    await contentful.init();
    return this.load();
  }
  
  async load() {
    // Load the league entry
    this.entry = await contentful.get(this.id);
    
    // Load the active season
    this.season = await Season.load(this.activeSeason);
    
    // Load active drivers
    this.drivers = await this.loadDrivers();
    
    return this;
  }
  
  getRace(raceId) {
    return contentful.get({ content_type: 'race', 'fields.raceId': parseInt(raceId, 10) });
  }
  
  getLastRace(options = {}) {
    return this.season.results
      .filter(race => moment().isSameOrAfter(race.date, 'day'))
      //TODO: Can this filter be dynamic based on options[key]?
      .filter(race => options.track 
        ? race.track.toLowerCase().indexOf(options.track) >= 0 
        : true
      )
      .sort((a, b) => moment(a.date).diff(b.date))
      .pop();
  }
  
  getNextRace(options = {}) {
    return this.season.schedule
  		.filter(item => !item.raceId)
  		.sort((a, b) => moment(b.date).diff(a.date))
  		.pop();
  }
  
  getSeason(id) {
    return /*this.seasons.find(season => season.sys.id === id) || */contentful.get(id);
  }
  
  getDriver(name) {
    return this.drivers.find(driver => driver.name === name);
  }
  
  getDrivers(field) {
    const [[key, val]] = Object.entries(field);
    return this.drivers.filter(driver => driver[key] === val);
  }
  
  async loadDrivers() {
    const drivers = await contentful.get({ content_type: 'driver', limit: 500 });
    return drivers.map(driver => new Driver(driver));
  }
  
  mapDriver(name) {
    return this.getDriver(name) || Driver.create({ name, active: false });
  }
  
  getStats(name) {
    return this.stats.find(({ driver }) => driver === name);
  }
  
  createRace(props) {
    return contentful.createEntry('race', props);
  }
  
  async addAssetToRace(entry, asset) {
    entry.fields.media = { 'en-US': entry.fields.media 
      ? entry.fields.media['en-US'].concat(await contentful.createAsset(asset))
      : [await contentful.createAsset(asset)]
    };
    return contentful.update(entry);
  }
  
  addLogoToRace(entry, asset = []) {
    return contentful.update(entry, { logo: asset.shift() });
  }
  
  addBroadcastToRace(entry, url) {
    return contentful.update(entry, { broadcast: url });
  }
  
  updateRace(entry, props) {
    return contentful.update(entry, props);
  }

  updateSeason(entry, props) {
    return contentful.update(entry, props);
  }
  
  updateLeague(props) {
    return contentful.update(this.league, props);
  }
  
}

module.exports = new League()