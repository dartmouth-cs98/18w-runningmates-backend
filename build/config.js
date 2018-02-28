'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const _dotenv = require('dotenv');

const _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config({ silent: true });

exports.default = {
  secret: process.env.AUTH_SECRET,
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  s3_bucket: process.env.S3_BUCKET,
  strava_access_token: process.env.STRAVA_ACCESS_TOKEN,
  strava_client_id: process.env.STRAVA_CLIENT_ID,
  strava_client_secret: process.env.STRAVA_CLIENT_SECRET,
  strava_redirect_uri: process.env.STRAVA_REDIRECT_URI,
};
