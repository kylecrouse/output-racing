const Entry = require('./entry');
const contentful = require('./index');

class Driver extends Entry {
  static async create(fields) {
    // Create the new entry
    const entry = await super.create('driver', fields);

    // Return new entry as convenience class
    return new Driver(entry);
  }
  
  constructor(entry) {
    super(entry);
  }
  
  async put(fields) {
    //translate media field updates to assets
    if (Object.keys(fields).includes('media')) {
      fields.media = [await contentful.createAsset(fields.media)];
    }
    super.put(fields);
  }
}
  
module.exports = Driver;