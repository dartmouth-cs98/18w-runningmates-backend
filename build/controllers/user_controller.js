'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUsers = exports.updateUser = exports.signup = exports.signin = undefined;

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// encodes a new token for a user object
function tokenForUser(user) {
  var timestamp = new Date().getTime();
  return _jwtSimple2.default.encode({ sub: user.id, iat: timestamp }, _config2.default.secret);
}

var signin = exports.signin = function signin(req, res, next) {
  res.send({ token: tokenForUser(req.user), user: req.user });
};

/*eslint-disable*/
var signup = exports.signup = function signup(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var coords = [64.7511, 147.3494];

  console.log('function was made');
  // Check that there is an email and a password
  if (!username || !password) {
    return res.status(422).send('You must provide username and password');
  }

  // Check if there exists a user with that email
  _user2.default.findOne({ username: username }).then(function (found) {
    if (!found) {
      var user = new _user2.default();
      user.username = username;
      user.password = password;
      user.email = email;
      // user.location = {"coordinates": coords};

      user.save().then(function (result) {
        res.send({ token: tokenForUser(result) });
      }).catch(function (error) {
        console.log(error);
        res.json({ error: 'first one' });
      });
    } else {
      console.log("already exists");
      res.json('User already exists');
    }
  }).catch(function (error) {
    console.log(error);
    res.json({ error: error });
  });
};

var updateUser = exports.updateUser = function updateUser(req, res, next) {
  console.log("updating user");

  var username = req.params.username;
  console.log(username);
  var email = req.body.email;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var imageURL = req.body.imageURL;
  var bio = req.body.bio;
  var gender = req.body.gender;
  var age = req.body.age;
  var location = req.body.location;

  _user2.default.findOne({ username: username }).then(function (found) {
    if (found) {
      console.log("user exists");
      _user2.default.update({ username: username }, {
        firstName: firstName,
        lastName: lastName,
        imageURL: imageURL,
        bio: bio,
        gender: gender,
        age: age,
        location: location
      }).then(function (user) {
        console.log("successfully updated user");
        res.send('updated user');
      }).catch(function (error) {
        console.log("error updating user");
        console.log(error);
        res.status(500).json({ error: error });
      });
    } else {
      console.log("user does not exist");
      res.json("User does not exist");
    }
  });
};

// Manage sending back users
/*
  To get a list of users sorted by preferences, body must have parameters: location,
  id
*/
var getUsers = exports.getUsers = function getUsers(req, res) {

  if ('location' in req.body && 'username' in req.body) {
    var username = req.body.username;
    var location = req.body.location;
    _user2.default.findOne({ 'username': username }).then(function (user) {
      console.log(user);
      // preferences = user.preferences;

      // IN METERS
      var maxDistance = 10000; // Needs to be meters, convert from preferences.maxDistance
      // location needs to be an array of floats [<long>, <lat>]
      _user2.default.find({
        location: {
          $near: location,
          $maxDistance: maxDistance
        }
      }).then(function (users) {
        // DO SOMETHING WITH LIST OF NEARBY USERS
        // Need to limit #users sent back
        res.json(users);
      }).catch(function (error) {
        console.log(error);
        res.json({ error: error });
      });

      // user.Update({'location': })
    }).catch(function (error) {
      console.log(error);
      res.json({ error: error });
    });
  }
};

/*eslint-enable*/