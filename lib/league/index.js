const cms = require('../contentful');
const moment = require('moment');

class League {
  constructor() {
    this.id = 1710;
    this.season = { fields: {
      results: { 'en-US': [] }
    }};
    this.drivers = [];
  }
  
  async init() {
    if (this.props) return this.props;
    await cms.init();
    return this.get();
  }
  
  async get() {
    // TODO: Every time a CRUD is run, refresh singleton data?
    this.league = await cms.get(this.id);
    this.season = await cms.get(this.league.fields.activeSeason['en-US'].sys.id)
    this.season.fields.results['en-US'] = await Promise.all(
      this.season.fields.results['en-US'].map(entry => cms.get(entry.sys.id))
    );
    this.season.fields.id = { 'en-US': this.league.fields.activeSeason['en-US'].sys.id };
    await this.getDrivers();
    return this.league;
  }
  
  getRace(raceId) {
    return cms.get({ content_type: 'race', 'fields.raceId': parseInt(raceId, 10) });
  }
  
  getLastRace(options = {}) {
    return this.season.fields.results['en-US']
      .filter(race => moment().isSameOrAfter(race.fields.date['en-US'], 'week'))
      //TODO: Can this filter be dynamic based on options[key]?
      .filter(race => options.track ? race.fields.track['en-US'].toLowerCase().indexOf(options.track) >= 0 : true)
      .sort((a, b) => moment(a.fields.date['en-US']).diff(b.fields.date['en-US']))
      .pop();
  }
  
  getNextRace(options = {}) {
    return this.season.fields.schedule['en-US']
  		.filter(item => !item.raceId)
  		.sort((a, b) => moment(b.date).diff(a.date))
  		.pop();
  }
  
  getSeason(id) {
    return /*this.seasons.find(season => season.sys.id === id) || */cms.get(id);
  }
  
  getDriver(id) {
    return this.drivers.find(driver => driver.sys.id === id) || cms.get(id);
  }
  
  async getDrivers() {
    this.drivers = await cms.get({ content_type: 'driver', limit: 500 });
    return this.drivers;
  }
  
  getStats(name) {
    return this.league.fields.stats['en-US'].find(({ driver }) => driver === name);
  }
  
  findDriver({ field, value }) {
    return this.drivers.find(driver => driver.fields[field] && driver.fields[field]['en-US'] === value);
  }
  
  mapDriver(name) {
    return this.findDriver({ field: 'name', value: name })
      || this.createDriver({ name, active: false });
  }
  
  createDriver(props) {
    return cms.createEntry('driver', props);
  }
  
  createRace(props) {
    return cms.createEntry('race', props);
  }
  
  async addAssetToRace(entry, asset) {
    entry.fields.media = { 'en-US': entry.fields.media 
      ? entry.fields.media['en-US'].concat(await cms.createAsset(asset))
      : [await cms.createAsset(asset)]
    };
    return cms.update(entry);
  }
  
  addLogoToRace(entry, asset = []) {
    return cms.update(entry, { logo: asset.shift() });
  }
  
  addBroadcastToRace(entry, url) {
    return cms.update(entry, { broadcast: url });
  }
  
  async updateDriver(entry, props) {
    // NOTE: Handling media here since cms.update isn't equipped for merging arrays yet.
    if (props.media) {
      entry.fields.media = { 'en-US': entry.fields.media 
        ? entry.fields.media['en-US'].concat(await cms.createAsset(asset))
        : [await cms.createAsset(asset)]
      };
      delete props["media"];
    }
    return cms.update(entry, props).then(async (entry) => {
      await this.getDrivers();
      return entry;
    });
  }
  
  updateRace(entry, props) {
    return cms.update(entry, props);
  }

  updateSeason(entry, props) {
    return cms.update(entry, props);
  }
  
  updateLeague(props) {
    return cms.update(this.league, props);
  }
}

module.exports = new League()