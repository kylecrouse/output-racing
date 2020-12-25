const _ = require('lodash');
const contentful = require('./index');

class Entry {
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
  
  static async load(arg) {
    // Check if arg is a contentful-like object
    if (typeof arg === 'object' && 'sys' in arg) {
      // If arg is a link, resolve the include
      if (arg.sys.type === 'Link')
        return contentful.get(arg.sys.id);
      // Otherwise assume arg is an entry
      else 
        return arg;
    }
    // Otherwise assume arg is an id string
    else 
      // Load the requested entry
      return contentful.get(arg);
  }
  
  constructor(entry) {
    this.entry = entry;
    
    // Use a proxy to allow direct access to field locale values
    return new Proxy(this, {
      get: (target, prop) => {
        // Return props on target first to allow override of fields (for includes)
        if (prop in target)
          return target[prop];
        // Otherwise try to resolve prop to the entry
        else if (target.entry) {
          // First check in fields
          if (prop in target.entry.fields)
            return target.entry.fields[prop]['en-US'];
          // Second look at sys (for id)
          if (prop in target.entry.sys)
            return target.entry.sys[prop];
        }
        // Nothing found for prop
        return undefined;
      }
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
