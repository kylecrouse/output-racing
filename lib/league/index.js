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
    try {
      const league = await cms.get(this.id);
      this.season = await cms.get(league.fields.activeSeason['en-US'].sys.id)
      this.season.fields.results['en-US'] = await Promise.all(
        this.season.fields.results['en-US'].map(entry => cms.get(entry.sys.id))
      );
      this.drivers = await cms.get({ content_type: 'driver', limit: 500 });
      return league;
    } catch(error) {
      console.error(error);
    }
  }
  
  getRace(id) {
    return cms.get(id);
  }
  
  getLastRace(options = {}) {
    return this.season.fields.results['en-US']
      .filter(race => moment().isSameOrAfter(race.fields.date['en-US'], 'day'))
      //TODO: Can this filter be dynamic based on options[key]?
      .filter(race => options.track ? race.track['en-US'].indexOf(options.track) >= 0 : true)
      .sort((a, b) => moment(a.fields.date['en-US']).diff(b.fields.date['en-US']))
      .pop();
  }
  
  getDriver(id) {
    return this.drivers.find(driver => driver.sys.id === id) || cms.get(id);
  }
  
  findDriver({ field, value }) {
    return this.drivers.find(driver => driver.fields[field]['en-US'] === value);
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
  
  updateRace(entry, props) {
    return cms.update(entry, props);
  }
}

module.exports = new League()