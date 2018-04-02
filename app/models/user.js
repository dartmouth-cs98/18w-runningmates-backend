import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const UserSchema = new Schema({
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
    default: [0, 0],
  },
  desiredGoals: [],  // Dropdown/Scroll
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
    pace: [], // Range [slowestPace, fastestPace]
    age: [], // Range [minAge, maxAge]
    proximity: Number,
  },
  thirdPartyIds: {},  // {{ "third party name": 'ID'}}
  data: {
    totalMilesRun: Number,
    totalElevationClimbed: Number,
    runsPerWeek: Number, // User Input
    racesDone: [],
    longestRun: String,
  },
}, {
  toJSON: {
    virtuals: true,
  },
});
UserSchema.index({ location: '2dsphere' });

/* eslint-disable */

UserSchema.pre('save', function beforeUserSave(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }

  // hash (encrypt) our password using the salt
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }

    // overwrite plain text password with encrypted password
      user.password = hash;
      return next();
    });
  });
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) { return callback(err); }

    callback(null, isMatch);
  });
};
/* eslint-enable */

// create model class
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
