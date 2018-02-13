import AWS from 'aws-sdk';
import config from '../config';


AWS.config.update({ accessKeyId: config.aws_access_key_id,
  secretAccessKey: config.aws_secret_access_key });

const s3 = new AWS.S3();

const myBucket = 'runningmates-profile-pictures';


export default function getSignedUrl(photoKey) {
  const params = { Bucket: myBucket, Key: photoKey };

  s3.getSignedUrl('getObject', params, (err, url) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Signed URL: ${url}`);
    }
  });
}
