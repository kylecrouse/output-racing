const contentful = require('./index');
const Entry = require('./entry');
const Race = require('./race');

class Season extends Entry {
  static async create(fields) {
    // Create the new entry
    const entry = await super.create('season', fields);

    // Return new entry as convenience class
    return new Season(entry);
  }
  
  static async load(id) {
    // Load the requested entry
    const season = await super.load(id);

    // Load linked entries
    const results = await contentful.get({
      content_type: 'race',
      'sys.id[in]': season.fields.results['en-US']
        .map(entry => entry.sys.id)
        .join(',')
    })

    return new Season(
      season, 
      results.map(race => new Race(race))
    );
  }
  
  constructor(entry, includes) {
    super(entry);
    this.results = includes;
  }
  
  async put(fields) {
    //translate media field updates to assets
    if (Object.keys(fields).includes('media')) {
      fields.media = [await contentful.createAsset(fields.media)];
    }
    super.put(fields);
  }
}
  
module.exports = Season;