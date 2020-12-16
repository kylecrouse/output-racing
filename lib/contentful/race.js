const Entry = require('./entry');
const contentful = require('./index');

class Race extends Entry {
  static async create(fields) {
    // Create the new entry
    const entry = await super.create('race', fields);

    // Return new entry as convenience class
    return new Race(entry);
  }
  
  static async load(arg) {
    let season;
    if (typeof arg === 'object' && sys in arg) {
      // If arg is a link, resolve the include
      if (arg.sys.type === 'Link')
        season = await contentful.get(arg.sys.id);
      // Otherwise assume arg is an entry
      else 
        season = arg;
    }
    // Otherwise assume arg is an id string
    else 
      // Load the requested entry
      season = (await super.load({ content_type: 'race', 'fields.raceId': arg }))[0];
    
    // Load linked entries
    const results = await contentful.get({
      content_type: 'race',
      'sys.id[in]': season.fields.results['en-US'].map(entry => entry.sys.id)
    })
    
    return new Season(
      season, 
      results.items.map(race => new Race(race))
    );
  }

  
  constructor(entry, includes = {}) {
    super(entry);
    // this.logo = includes.logo || null;
    // this.media = includes.media || [];
  }
  
  async put(fields) {
    //translate logo field updates to asset
    if (Object.keys(fields).includes('logo')) {
      fields.logo = await contentful.createAsset(fields.logo);
    }
    //translate media field updates to assets
    if (Object.keys(fields).includes('media')) {
      fields.media = [await contentful.createAsset(fields.media)];
    }
    super.put(fields);
  }
}
  
module.exports = Race;