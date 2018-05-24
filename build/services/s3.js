'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateUser(res, key, count, fileNames, data) {
  if (Number(key) === Number(fileNames.length - 1) && Number(count) === Number(data.length)) {
    res.send(data);
  }
}
var signS3 = function signS3(req, res) {
  var s3 = new _awsSdk2.default.S3();
  /*eslint-disable*/
  var images = [];
  var count = 0;
  /*eslint-enable*/
  var fileNames = req.body.fileNames;
  var fileType = req.body.fileType;
  console.log(fileNames);
  /* eslint-disable*/

  var _loop = function _loop(key) {
    if (fileNames[key]) {
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
          res.status(422).end();
        }

        var returnData = {
          signedRequest: data,
          url: 'https://' + _config2.default.s3_bucket + '.s3.amazonaws.com/' + fileName
        };
        var imageTemp = images;
        imageTemp.push(returnData);
        count += 1;
        var currKey = key;
        images = imageTemp;
        updateUser(res, currKey, count, fileNames, imageTemp);
      });
    }
  };

  for (var key in fileNames) {
    _loop(key);
  }

  /* eslint-enable*/
};

exports.default = signS3;