const { createReadStream, promises: { readdir, stat: getStats } } = require('fs');
const { resolve, join } = require('path');
const AWS = require('aws-sdk');
const mime = require('mime-types');

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-west-2', 
  credentials: new AWS.SharedIniFileCredentials({ profile: 'orl' }),
  params: { Bucket: 'output-racing' }
});

// upload file
const uploadFile = async function uploadFile({ path, params, options } = {}) {
  const parameters = { ...params };
  const opts = { ...options };

  try {
    const rstream = createReadStream(resolve(path));

    rstream.once('error', (err) => {
      console.error(`unable to upload file ${path}, ${err.message}`);
    });

    parameters.Body = rstream;
    parameters.ContentType = mime.lookup(path);
    await s3.upload(parameters, opts).promise();

    // console.info(`${parameters.Key} (${parameters.ContentType}) uploaded in bucket ${parameters.Bucket}`);
  } catch (e) {
    throw new Error(`unable to upload file ${path} at ${parameters.Key}, ${e.message}`);
  }

  return true;
};

// upload directory and its sub-directories if any
const uploadDirectory = async function uploadDirectory({
  path,
  params,
  options,
  rootKey,
} = {}) {
  const parameters = { ...params };
  const opts = { ...options };
  const root = rootKey && rootKey.constructor === String ? rootKey : '';
  let dirPath;

  try {
    dirPath = resolve(path);
    const dirStats = await getStats(dirPath);

    if (!dirStats.isDirectory()) {
      throw new Error(`${dirPath} is not a directory`);
    }

    // console.info(`uploading directory ${dirPath}...`);

    const filenames = await readdir(dirPath);

    if (Array.isArray(filenames)) {
      await Promise.all(filenames.map(async (filename) => {
        const filepath = `${dirPath}/${filename}`;
        const fileStats = await getStats(filepath);

        if (fileStats.isFile()) {
          parameters.Key = join(root, filename);
          await uploadFile({
            path: filepath,
            params: parameters,
            options: opts,
          });
        } else if (fileStats.isDirectory()) {
          await uploadDirectory({
            params,
            options,
            path: filepath,
            rootKey: join(root, filename),
          });
        }
      }));
    }
  } catch (e) {
    throw new Error(`unable to upload directory ${path}, ${e.message}`);
  }

  // console.info(`directory ${dirPath} successfully uploaded`);
  return true;
};

module.exports = { uploadFile, uploadDirectory };