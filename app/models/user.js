import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const UserSchema = new Schema({
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
    default: [0, 0],
  },
  desiredGoals: [],  // Dropdown/Scroll
  swipes: { count: Number, date: String },
  mates: [],
  potentialMates: [],
  blockedMates: [],
  emergencyContacts: [],
  seenProfiles: [{ userID: Number, date: String }],
  email: { type: String, unique: true, lowercase: true },
  password: String,
  token: String,
  preferences: {
    gender: { type: Array, default: ['Male', 'Female', 'Non-Binary'] }, // List of genders to have in preferences (female, male, non non-binary)
    runLength: { type: Array, default: [0, 25] }, // Range [minMiles, maxMiles]
    age: { type: Array, default: [18, 99] }, // Range [minAge, maxAge]
    proximity: { type: Number, default: 80467 },

  },
  thirdPartyIds: {},  // {{ "third party name": 'ID'}}
  data: {
    totalMilesRun: { type: Number, default: 0 },
    totalElevationClimbed: { type: Number, default: 0 },
    runsPerWeek: { type: Number, default: 0 }, // User Input
    milesPerWeek: { type: Number, default: 0 }, // User input and/or MAYBE STRAVA/NIKE/APPLE?!
    racesDone: [],
    averageRunLength: { type: Number, default: 0 },
    longestRun: { type: String, default: '' },
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
