import aws from 'aws-sdk';
import config from '../config';

const signS3 = (req, res) => {
  const s3 = new aws.S3();
  const images = [];
  const fileNames = req.query['file-names'];
  const fileType = req.query['file-type'];

  /* eslint-disable*/
  for (const key in fileNames) {
    if (fileNames[key]) {
      const fileName = fileNames[key];
      const s3Params = {
        Bucket: config.s3_bucket,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read',
      };
      s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) { res.status(422).end(); }

        const returnData = {
          signedRequest: data,
          url: `https://${config.s3_bucket}.s3.amazonaws.com/${fileName}`,
        };
        images.push(returnData)
      });
    }
  }
  /* eslint-enable*/
  return (res.send(JSON.stringify(images)));
};

export default signS3;
