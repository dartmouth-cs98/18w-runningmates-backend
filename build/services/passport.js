'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requireSignin = exports.requireAuth = undefined;

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportLocal = require('passport-local');

var _passportLocal2 = _interopRequireDefault(_passportLocal);

var _passportJwt = require('passport-jwt');

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// options for local strategy, we'll use email AS the username
// not have separate ones


// and import User
var localOptions = { usernameField: 'email' };

// options for jwt strategy
// we'll pass in the jwt in an `authorization` header
// so passport can find it there


// lets import some stuff
var jwtOptions = {
  jwtFromRequest: _passportJwt.ExtractJwt.fromHeader('authorization'),
  secretOrKey: _config2.default.secret
};

// username + password authentication strategy
var localLogin = new _passportLocal2.default(localOptions, function (email, password, done) {
  // Verify this email and password, call done with the user
  // if it is the correct email and password
  // otherwise, call done with false
  _user2.default.findOne({ email: email }, function (err, user) {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false);
    }

    // compare passwords - is `password` equal to user.password?
    return user.comparePassword(password, function (err, isMatch) {
      if (err) {
        return done(err);
      } else if (!isMatch) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    });
  });
});

var jwtLogin = new _passportJwt.Strategy(jwtOptions, function (payload, done) {
  // See if the user ID in the payload exists in our database
  // If it does, call 'done' with that other
  // otherwise, call done without a user object
  _user2.default.findById(payload.sub, function (err, user) {
    if (err) {
      done(err, false);
    } else if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

// Tell passport to use this strategy
_passport2.default.use(jwtLogin);
_passport2.default.use(localLogin);

var requireAuth = exports.requireAuth = _passport2.default.authenticate('jwt', { session: false });
var requireSignin = exports.requireSignin = _passport2.default.authenticate('local', { session: false });