'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserSchema = new _mongoose.Schema({
  firstName: String,
  lastName: String,
  imageURL: String,
  images: [{ data: Buffer, contentType: String }],
  bio: String,
  gender: String,
  age: Number,
  location: {
    type: [],
    index: { type: '2dsphere', sparse: true },
    default: [0, 0]
  },
  desiredGoals: [], // Dropdown/Scroll
  swipes: { count: Number, date: String },
  mates: [],
  potentialMates: [],
  blockedMates: [],
  seenProfiles: [{ userID: Number, date: String }],
  email: { type: String, unique: true, lowercase: true },
  password: String,
  token: String,
  preferences: {
    gender: String,
    runLength: [], // Range [minMiles, maxMiles]
    age: [], // Range [minAge, maxAge]
    proximity: Number

  },
  thirdPartyIds: {}, // {{ "third party name": 'ID'}}
  data: {
    totalMilesRun: Number,
    totalElevationClimbed: Number,
    runsPerWeek: Number, // User Input
    milesPerWeek: Number, // User input and/or MAYBE STRAVA/NIKE/APPLE?!
    racesDone: [],
    averageRunLength: Number,
    longestRun: String
  }
}, {
  toJSON: {
    virtuals: true
  }
});
UserSchema.index({ location: '2dsphere' });

/* eslint-disable */

UserSchema.pre('save', function beforeUserSave(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  _bcryptNodejs2.default.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }

    // hash (encrypt) our password using the salt
    _bcryptNodejs2.default.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        return next(err);
      }

      // overwrite plain text password with encrypted password
      user.password = hash;
      return next();
    });
  });
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  _bcryptNodejs2.default.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return callback(err);
    }

    callback(null, isMatch);
  });
};
/* eslint-enable */

// create model class
var UserModel = _mongoose2.default.model('User', UserSchema);

exports.default = UserModel;