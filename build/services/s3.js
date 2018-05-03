'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var signS3 = function signS3(req, res) {
  var s3 = new _awsSdk2.default.S3();
  var images = [];
  var fileNames = req.query['file-names'];
  var fileType = req.query['file-type'];

  /* eslint-disable*/
  for (var key in fileNames) {
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
            res.status(422).end();
          }

          var returnData = {
            signedRequest: data,
            url: 'https://' + _config2.default.s3_bucket + '.s3.amazonaws.com/' + fileName
          };
          images.push(returnData);
        });
      })();
    }
  }
  /* eslint-enable*/
  return res.send(JSON.stringify(images));
};

exports.default = signS3;