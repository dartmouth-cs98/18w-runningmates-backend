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
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  imageURL: { type: String, default: '' },
  images: [],
  bio: { type: String, default: '' },
  gender: { type: String, default: '' },
  age: { type: Number, default: 0 },
  birthMonth: { type: Number, default: 0 },
  birthDay: { type: Number, default: 0 },
  birthYear: { type: Number, default: 0 },
  location: {
    type: [],
    index: { type: '2dsphere', sparse: true },
    default: [0, 0]
  },
  desiredGoals: [], // Dropdown/Scroll
  swipes: { count: Number, date: String },
  mates: {},
  potentialMates: {},
  requestsReceived: {},
  blockedMates: {},
  emergencyContacts: [],
  seenProfiles: [{ userID: Number, date: String }],
  email: { type: String, unique: true, lowercase: true },
  password: String,
  token: String,
  preferences: {
    gender: { type: Array, default: ['Male', 'Female', 'Non-Binary'] }, // List of genders to have in preferences (female, male, non non-binary)
    runLength: { type: Array, default: [0, 25] }, // Range [minMiles, maxMiles]
    age: { type: Array, default: [18, 99] }, // Range [minAge, maxAge]
    proximity: { type: Number, default: 40233.6 }

  },
  thirdPartyIds: {}, // {{ "third party name": 'ID'}}
  data: {
    totalMilesRun: { type: Number, default: 0 },
    totalElevationClimbed: { type: Number, default: 0 },
    runsPerWeek: { type: Number, default: 0 }, // User Input
    milesPerWeek: { type: Number, default: 0 }, // User input and/or MAYBE STRAVA/NIKE/APPLE?!
    racesDone: [],
    averageRunLength: { type: Number, default: 0 },
    longestRun: { type: String, default: '' }
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

UserSchema.query.friendRequests = function (ids) {
  var length = ids.length;
  var dbIds = [];
  for (var i = 0; i < ids.length; i++) {
    dbIds.push(_mongoose2.default.Types.ObjectId(String(ids[i])));
  }
  return this.find({
    '_id': { $in: dbIds }
  });
};
/* eslint-enable */

// create model class
var UserModel = _mongoose2.default.model('User', UserSchema);

exports.default = UserModel;