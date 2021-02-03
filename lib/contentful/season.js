const contentful = require('./index');
const Entry = require('./entry');
const Race = require('./race');

class Season extends Entry {
  static async create(id, fields) {
    // Create the new entry
    const entry = await super.create('season', fields, id);

    // Return new entry as convenience class
    return new Season(entry);
  }
  
  static async load(arg) {

    // Overloaded to accept an array of links and 
    // map each linked entry to a new Season
    if (Array.isArray(arg)) {

      // Get entries for all seasons requested
      const seasons = await contentful.get({
        content_type: 'season',
        'sys.id[in]': arg.map(entry => entry.sys.id).join(',')
      });

      // Map fetched seasons to Season wrapper
      return Promise.all(
        seasons.map(async (season) => {
          // Just return the season if there are no results yet.
          if (!season.fields.results) return new Season(season);
          
          // Translate all results includes
          const results = await contentful.get({
            content_type: 'race',
            'sys.id[in]': season.fields.results['en-US']
              .map(entry => entry.sys.id)
              .join(',')
          });
          
          // Return wrapped entry with includes
          return new Season(
            season, 
            results.map(race => new Race(race))
          );
        })
      );
    }
    
    // Load season from arg as entry ID
    else {
      
      // Load the requested entry
      const season = await super.load(arg);

      // Just return the season if there are no results yet.
      if (!season.fields.results) return new Season(season);

      // Translate all results includes
      const results = await contentful.get({
        content_type: 'race',
        'sys.id[in]': season.fields.results['en-US']
          .map(entry => entry.sys.id)
          .join(',')
      });
  
      // Return wrapped entry with includes
      return new Season(
        season, 
        results.map(race => new Race(race))
      );
  
    }
    
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
    return super.put(fields);
  }
}
  
module.exports = Season;