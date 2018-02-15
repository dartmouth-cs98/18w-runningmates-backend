'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserStravaSchema = new _mongoose.Schema({
  id: Number,
  recentCount: String,
  recentDistance: Number,
  recentMovingTime: Number,
  totalCount: Number,
  totalDistance: Number,
  totalMovingTime: Number,
  totalElapsedTime: Number,
  totalElevationGain: Number,
  koms: [],
  listActivities: [],
  listSegments: [{ title: String, id: String, count: Number, pr: String }]
});

var UserStrava = _mongoose2.default.model('UserStrava', UserStravaSchema);

exports.default = UserStrava;