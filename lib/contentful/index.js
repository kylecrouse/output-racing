const fetch = require('node-fetch');
const mime = require('mime-types');
const contentful = require('contentful-management');
const { getSecretValue } = require(`${process.cwd()}/lib/secrets`);
// const { CONTENTFUL_SPACE_ID, CONTENTFUL_ENVIRONMENT_ID } = process.env;

const CONTENTFUL_SPACE_ID = '38idy44jf6uy';
const CONTENTFUL_ENVIRONMENT_ID = 'master';

class Client {
  constructor() {
    this.environment = null;
  }

  async init() {
    if (this.environment) return;
    const { accessToken } = await getSecretValue('ORLBot/ContentfulManagementAPI');
    const client = contentful.createClient({ accessToken });
    const space = await client.getSpace(CONTENTFUL_SPACE_ID);
    this.environment = await space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID);
  }
  
  async get(params) {
    if (typeof params === 'object') {
      const entries = await this.environment.getEntries(params);
      return entries.items;//.map(item => objectMap(item.fields, delocalize));
    }
    else {
      const entry = await this.environment.getEntry(params);
      return entry;//objectMap(entry.fields, delocalize);
    }
  }
  
  getAsset(id) {
    return this.environment.getAsset(id);
  }
  
  update(entry, props = null) {
    if (props) {
      // Merge existing fields with new (localized) fields
      // TODO: This should concat array fields instead of replace them
      entry.fields = { 
        ...entry.fields, 
        ...objectMap(props, v => ({ 'en-US': v }))
      };
    }
    return entry.update().then(entry => entry.publish());
  }
  
  async createAsset({ name, url }) {
    return this.environment
      .createAssetFromFiles({
        fields: {
          title: localize(name),
          file: localize({
            contentType: mime.lookup(url),
            fileName: name,
            file: await fetch(url).then(res => res.buffer())
          })
        }
      })
      .then(asset => asset.processForAllLocales())
      .then(asset => asset.publish())
      .then(asset => linkAsset(asset.sys.id));
  }
  
  createEntry(content_type, fields) {
    return this.environment.createEntry(content_type, { fields: objectMap(fields, v => ({ 'en-US': v })) })
      .then(entry => entry.publish());
  }

  createEntryWithId(content_type, id, fields) {
    return this.environment.createEntryWithId(content_type, id, { fields: objectMap(fields, v => ({ 'en-US': v })) })
      .then(entry => entry.publish());
  }

}

module.exports = new Client();

const objectMap = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    )
  );
  
const delocalize = ({ ['en-US']: field }) => field;

const localize = (field) => ({ 'en-US': field });

const linkAsset = (id) => (
  { sys: { type: "Link", linkType: "Asset", id }}
);
