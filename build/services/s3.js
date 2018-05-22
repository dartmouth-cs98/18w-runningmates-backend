'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateUser(res, key, fileNames, data) {
  console.log(key);
  console.log(fileNames.length);
  if (key === fileNames.length - 1) {
    console.log('READY TO SEND');
    res.send(data);
  }
}
var signS3 = function signS3(req, res) {
  var s3 = new _awsSdk2.default.S3();
  /*eslint-disable*/
  var images = [];
  var key = 0;
  /*eslint-enable*/
  var fileNames = req.body.fileNames;
  var fileType = req.body.fileType;
  /* eslint-disable*/
  for (key in fileNames) {
    if (fileNames[key]) {
      (function () {
        var fileName = fileNames[key];
        var s3Params = {
          Bucket: _config2.default.s3_bucket,
          Key: fileName,
          Expires: 60,
          ContentType: fileType,
          ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', s3Params, function (err, data) {
          if (err) {
            return res.status(422).end();
          }

          var returnData = {
            signedRequest: data,
            url: 'https://' + _config2.default.s3_bucket + '.s3.amazonaws.com/' + fileName
          };
          var imageTemp = images;
          imageTemp.push(returnData);
          images = imageTemp;
          updateUser(res, key, fileNames, imageTemp);
        });
      })();
    }
  }

  /* eslint-enable*/
};

exports.default = signS3;