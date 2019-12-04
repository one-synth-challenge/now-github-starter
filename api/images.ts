import {Storage} from '@google-cloud/storage';
import { RequestError } from 'google-auth-library/build/src/transporters';

Object.assign(process.env, {
    "GCLOUD_PROJECT": "osc-project",
    "CLOUD_BUCKET": "osc-data"
});

const config = require('../config');

const CLOUD_BUCKET = config.get('CLOUD_BUCKET');

const key = {
    "type": "service_account",
    "project_id": "osc-project-261008",
    "private_key_id": "b5676c71c9304a3a659e982572424dfd7e3e38fe",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDGJ+ChUGmXpHCy\nuNqZfiXq7S8VBdtpf/7TEG8ydAuq/yuHwJSJscK4B3hTrBTfaXrCsIEBh8puBZV5\nU7QPVsFCvUENoPTO444lp+zj8wqgGgRxM9AEmSU5GHn4WHmzcpR15bdpRVvo1K5w\nXzQpWkC3LwjpmwDLEWIQuMcRt18dEMvWS4fY2awgrYC1r/7dmQGFOnzdjsMWsdAJ\nlTe+sPO8+q+hQoHYwFMvehBMmLrvPKHLWKgJVafjCZd03QLVuwXVntjzEtLS9hhC\nCT1J/9tGYHhpFKI1yrZtf31JmeuoozCqM8rYRUIglNFqfsxx/cYZRlD+FfFqyQXt\nLqp07x3vAgMBAAECggEACh8qVxFSu3dmzE65gnuLKYNhDCDqhIcCKZ6eV3Y/6MWl\n3/gjKOaGxZGYHSZ6l5OLrrCHRYsE3HbZxrSaIM3JJ/a71nEaJ0TOfildHvhZk6ZX\nrhRmnpn0Pi+KYhS+4He+dbogPW/Ytdne2voIMAIeeECB2/uS/L46vDAKTHFQmfJx\nnv41V21NBjHm/e72rWck1zskVDzGMDHchMUSzHVWgc3N18rufefkMoK4NYOFERWt\nI8NZ2RKCuD/PIhgrQoIM5q2hEi1f3zXnnyU8mScE5sWH7o7CZv9l1JB+PIhJ270N\nEx3xeRCTBac/Q0XdyHEHI4eLZn/JIjbbFFtQ00V72QKBgQDlwd/dkTKNiLvQK2pe\npJimjro1c0PBMFjWWGHlm+PlpCZyOfw1qnhQUDt2RR89qzHxFlCk26JIfDpO1QHW\na/u7o8GjOsTQg+afSWgJLhK05FfGAI7ZU3pdP2Ur162JZaXbEcFiKa3PyCI7O0Ga\n3BH4tqyWcGLnsOJzUUekZqnnSQKBgQDcyfh/YIMwj4VQWbCcYBEl26xfnGiWMepg\nKenm7Xn8xgyhnPeNO6fpmvt0bwN02Z7JmFZ9egBR4U25Dgei6RwOzychkk5r7phD\nzDs1ezgTeNYf44j+z7q2pAuZhLIJBCp4vR00B7VG6s/wwHnPkjbCqFrW+geTnU8t\nYafK4ojDdwKBgEtXp0SuH4jAJO6fvhLpINHFjhSHBtnsM8WeWAQGedZNXPoqP6WN\nkESt+sHO6u67G/Z2Hd3h1Da23hwJx797y6H9kjsnw3CpQFBNrxsLi8Db/FiGyFFG\nCaNYbaHR6StcNOZAzUyWZFP1yhvoU5wnvJD1vmTa1+QoYin0pmyn6eFZAoGBAJIV\nSEfvMZ4Vt91cGpC8t1vXJwvzzvdhe3O5B7v1cHshBwZ/dwOJbyYPl0SIlz7fJkK4\nerF24XNLoUNJ1x+hISFjSr7ZsO2U5kYlgR93sbiggPyEbgY6p41kqRAgTjPM/9T3\nO7VLTFPp1T+z+mSul3DgN4p50D2JHfQm4wBINrktAoGBAIMVNS1OkEF7A8WvLyeU\n3qed5RICaFP37ltHA9qHYI0VP7RWfM7V7O7iiI5Bi0WX8ZqOKB/CsPzenBZsQa0Z\nn07JnXbD9hSvjEeRTiqrOdfQlyE0RceZ/Ru+b0b4Do7aTrsFJsZzn2Tn2zN/zzIR\nQiskbxbVhGDFR4Kke4n8vxUU\n-----END PRIVATE KEY-----\n",
    "client_email": "osc-data@osc-project-261008.iam.gserviceaccount.com",
    "client_id": "101868121735282726538",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/osc-data%40osc-project-261008.iam.gserviceaccount.com"
  }
;  

const storage = new Storage({
    credentials: key,
  projectId: config.get('GCLOUD_PROJECT')
});
const bucket = storage.bucket(CLOUD_BUCKET);

// Returns the public, anonymously accessable URL to a given Cloud Storage
// object.
// The object's ACL has to be set to public read.
// [START public_url]
function getPublicUrl (filename) {
  return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
}
// [END public_url]

// Express middleware that will automatically pass uploads to Cloud Storage.
// req.file is processed and will have two new properties:
// * ``cloudStorageObject`` the object name in cloud storage.
// * ``cloudStoragePublicUrl`` the public url to the object.
// [START process]
function sendUploadToGCS (req, res, next) {
  if (!req.file) {
    return next();
  }

  const gcsname = Date.now() + req.file.originalname;
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    },
    resumable: false
  });

  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    file.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
      next();
    });
  });

  stream.end(req.file.buffer);
}
// [END process]

// Multer handles parsing multipart/form-data requests.
// This instance is configured to store images in memory.
// This makes it straightforward to upload to Cloud Storage.
// [START multer]
const Multer = require('multer');
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb
  }
});
// [END multer]

// module.exports = {
//   getPublicUrl,
//   sendUploadToGCS,
//   multer
// };

import { NowRequest, NowResponse } from '@now/node';

const boo = async (res: NowResponse) => {
    const out = res.status(200);
    // Downloads the file
  await storage
  .bucket(config.get('CLOUD_BUCKET'))
  .file("Crookers.fxp")
  .download((err: RequestError | null, contents: Buffer) => {
      out.write(contents);
  });
}

export default async (_req: NowRequest, res: NowResponse) => {
    const [files] = await storage
        .bucket(config.get('CLOUD_BUCKET'))
        .getFiles();

    let out = '';
    console.log('Files:');
    files.forEach(file => {
        out += file.name;
    });
  res.status(200).send(out);
};


(async () => {
    const [files] = await storage.bucket(config.get('CLOUD_BUCKET')).getFiles();

    let out = '';
    console.log('Files:');
    files.forEach(file => {
        console.log(file.name);
        storage
            .bucket(config.get('CLOUD_BUCKET'))
            .file(file.name)
            .download((err: RequestError | null, contents: Buffer) => {
                console.log(contents.toString());
            });
    });
})

//();
