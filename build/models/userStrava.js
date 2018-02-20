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
  rmId: Number,
  athlete_type: Number,
  rRecentCount: String,
  rRecentDistance: Number,
  rRecentMovingTime: Number,
  rTotalCount: Number,
  rTotalDistance: Number,
  rTotalMovingTime: Number,
  rTotalElapsedTime: Number,
  rTotalElevationGain: Number,
  bRecentCount: String,
  bRecentDistance: Number,
  bRecentMovingTime: Number,
  bTotalCount: Number,
  bTotalDistance: Number,
  bTotalMovingTime: Number,
  bTotalElapsedTime: Number,
  bTotalElevationGain: Number,
  sRecentCount: String,
  sRecentDistance: Number,
  sRecentMovingTime: Number,
  sTotalCount: Number,
  sTotalDistance: Number,
  sTotalMovingTime: Number,
  sTotalElapsedTime: Number,
  sTotalElevationGain: Number,
  koms: [],
  listActivities: [{ id: String, name: String }],
  listSegments: [{ title: String, id: String, count: Number, pr: String }]
});

var UserStrava = _mongoose2.default.model('UserStrava', UserStravaSchema);

exports.default = UserStrava;