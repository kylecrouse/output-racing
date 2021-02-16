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

    // Include season links
    this.seasons = await Season.load(this.entry.fields.seasons['en-US']);
    
    // Load the active season
    this.season = await Season.load(this.activeSeason);
    
    // Load active drivers
    this.drivers = await this.loadDrivers();
    
    return this;
  }
  
  getRace(raceId) {
    return contentful.get({ 
      content_type: 'race', 
      'fields.raceId': parseInt(raceId, 10) 
    });
  }
  
  async getScheduledRace(scheduleId) {
    const [race] = await contentful.get({ 
      content_type: 'race', 
      'fields.scheduleId': parseInt(scheduleId, 10) 
    });
    return new Race(race);
  }
  
  getLastRace(options = {}) {
    const season = Array.isArray(this.season.results)
      ? this.season
      : this.seasons.find(season => season.id !== this.season.id);
      
    const race = season.results
      .filter(race => moment().isSameOrAfter(race.date, 'day'))
      //TODO: Can this filter be dynamic based on options[key]?
      .filter(race => options.track 
        ? race.track.toLowerCase().indexOf(options.track) >= 0 
        : true
      )
      .sort((a, b) => moment(a.date).diff(b.date));
    return race[race.length - 1];
  }
  
  getNextRace(options = {}) {
    if (!Array.isArray(this.season.schedule)) return null;
    
    const race = this.season.results
      .filter(item => !item.offWeek && !item.raceId)
      .filter(race => options.track && race.track
        ? race.track.match(new RegExp(options.track, 'i'))
        : true
      )
      .sort((a, b) => moment(b.date).diff(a.date));
    return race[race.length - 1];
  }
  
  getSeason(id) {
    return this.seasons.find(season => season.id === id);
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
    return this.getDriver(name) || this.addDriver({ name, active: false });
  }
  
  mapScheduledRace(props) {
    return this.getScheduledRace(props.scheduleId) || this.addRace(props);
  }
  
  getStats(name) {
    return this.stats.find(({ driver }) => driver === name);
  }
  
  getRace(raceId) {
    return Race.load(raceId);
  }
  
  addDriver(props) {
    return Driver.create(props);
  }
  
  addRace(props) {
    return Race.create(props);
  }

  addSeason(id, props) {
    return Season.create(id, props);
  }  
}

module.exports = new League()