const _ = require('lodash');
const contentful = require('./index');

class Entry {
  // Create a new entry with convenience wrapper
  static async new(args) {
    return new Entry(await this.create(args));
  }
  
  // Create an entry with no wrapper
  static async create(type, fields, id) {
    // Cause problems if the right arguments aren't provided
    if (!type || !fields) 
      throw new Error('Cannot create entry: missing arguments.');
    
    // Create the new entry 
    // NOTE: Contentful class is currently handling localization
    let entry = id
        ? await contentful.createEntryWithId(type, id, fields)
        : await contentful.createEntry(type, fields);
        
    // Publish the entry
    // NOTE: Contentful class is currently handling this step
    // entry = await entry.publish();

    // Return new entry
    return entry;
  }
  
  constructor(entry) {
    this.entry = entry;
    
    // Use a proxy to allow direct access to field locale values
    return new Proxy(this, {
      get: (target, prop) => target.entry && prop in target.entry.fields 
        ? target.entry.fields[prop]['en-US'] 
        : target[prop]
    });
  }
  
  put(fields) {
    // Set fields and update if successful
    return this.set(fields) 
      ? this.update()
      : this;
  }
  
  set(fields) {
    // map fields to locale, omitting unchanged fields
    fields = _.omitBy(
      _.mapValues(fields, value => ({ 'en-US': value })),
      (val, key) => _.isEqual(val, this.entry.fields[key])
    );
    
    console.log(Object.keys(fields));
    
    // continue if there are fields to update
    if (_.size(fields) > 0) {
      this.entry.fields = _.merge(this.entry.fields, fields); 
      return true;
    }
    // return false if nothing to update
    else {
      return false;
    }
  }
  
  update() {
    // Assume that all entries are always published by default
    return this.entry.update()
      .then(entry => entry.publish())
      .then(entry => {
        this.entry = entry;
        return this;
      });
  }  
}

module.exports = Entry;
