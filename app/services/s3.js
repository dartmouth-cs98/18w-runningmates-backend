import aws from 'aws-sdk';
import config from '../config';


function updateUser(res, key, count, fileNames, data) {
  if ((Number(key) === Number(fileNames.length - 1)) && (Number(count) === Number(data.length))) {
    res.send(data);
  }
}
const signS3 = (req, res) => {
  const s3 = new aws.S3();
  /*eslint-disable*/
  let images = [];
  let count = 0;
  /*eslint-enable*/
  const fileNames = req.body.fileNames;
  const fileType = req.body.fileType;
  console.log(fileNames);
  /* eslint-disable*/
  for (let key in fileNames) {
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
        if (err) {res.status(422).end(); }

        const returnData = {
          signedRequest: data,
          url: `https://${config.s3_bucket}.s3.amazonaws.com/${fileName}`,
        };
        let imageTemp = images;
        imageTemp.push(returnData);
        count += 1;
        let currKey = key;
        images = imageTemp;
        updateUser(res, currKey, count, fileNames, imageTemp);
      });
    }
  }

  /* eslint-enable*/
};

export default signS3;
