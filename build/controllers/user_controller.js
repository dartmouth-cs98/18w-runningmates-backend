'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUsers = exports.updateUser = exports.signup = exports.signin = undefined;

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _user2 = require('../models/user');

var _user3 = _interopRequireDefault(_user2);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var maxUsers = 15;
// encodes a new token for a user object
function tokenForUser(user) {
  var timestamp = new Date().getTime();
  return _jwtSimple2.default.encode({ sub: user.id, iat: timestamp }, _config2.default.secret);
}

var signin = exports.signin = function signin(req, res, next) {
  console.log('signing in');
  res.send({ token: tokenForUser(req.user), user: req.user });
};

/*eslint-disable*/
var signup = exports.signup = function signup(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var coords = [-147.349442, 64.751114];

  // Check that there is an email and a password
  if (!email || !password) {
    return res.status(421).send('You must provide email and password');
  }

  // Check if there exists a user with that email
  _user3.default.findOne({ email: email }).then(function (found) {
    if (!found) {
      var _user = new _user3.default();
      _user.password = password;
      _user.email = email;
      _user.location = coords;

      // user.location = {"coordinates": coords};

      _user.save().then(function (result) {
        res.send({ token: tokenForUser(result) });
      }).catch(function (error) {
        console.log(error);
        res.status(420).send('Error saving user');
      });
    } else {
      res.status(422).send('User already exists');
    }
  }).catch(function (error) {
    console.log(error);
    res.json({ error: error });
  });
};

var updateUser = exports.updateUser = function updateUser(req, res, next) {
  var email = req.body.email;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var imageURL = req.body.imageURL;
  var bio = req.body.bio;
  var gender = req.body.gender;
  var age = req.body.age;
  var location = req.body.location;
  var preferences = req.body.preferences;

  _user3.default.findOne({ email: email }).then(function (found) {
    if (found) {
      _user3.default.update({ email: email }, {
        firstName: firstName,
        lastName: lastName,
        imageURL: imageURL,
        bio: bio,
        gender: gender,
        age: age,
        location: location,
        preferences: preferences
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

/*
Helper sorting function to create a sorted list of users with their reason for matching.
Inputs: Users - list of users nearby; Preferences - User's preferences
Output: sortedUsers - [{userObject, matchReasonString}] - The sorted list of users based on a specific user's preferenceså
*/
function sortUsers(users, preferences) {
  var sortedUsers = [];

  return new Promise(function (fulfill, reject) {
    for (var key in users) {
      user = users[key];

      if (sortedUsers.length >= maxUsers) {
        break;
      }
      // Sort by gender
      if (preferences.gender == "Female" || preferences.gender == "Male") {
        if (user.gender !== preferences.gender) {
          continue;
        }
      };

      // If not in age range
      if (!(preferences.age[0] <= user.age) || !(preferences.age[1] >= user.age)) {
        continue;
      }

      // Conditional for pace here
      sortedUsers.append({ user: user, matchReason: "They're totally rad, brah." });
    };

    if (sortedUsers.length < 1) {
      reject("We couldn't find people in your area to fit your preferences.");
    }
    fulfill(sortedUsers);
  });
}
// Manage sending back users
/*
  To get a list of users sorted by preferences, body must have parameters: location,
  id
*/
var getUsers = exports.getUsers = function getUsers(req, res) {

  if ('location' in req.query && 'email' in req.query) {
    var email = req.query.email;
    var location = req.query.location;
    _user3.default.findOne({ 'email': email }).then(function (user) {
      console.log('user: ', user.preferences);
      preferences = user.preferences;

      // IN METERS
      var maxDistance = 10000; // Needs to be meters, convert from preferences.proximity
      // location needs to be an array of floats [<long>, <lat>]
      var query = _user3.default.find();
      console.log(location);
      query.where('location').near({ center: { type: 'Point', coordinates: location }, maxDistance: maxDistance }).then(function (users) {
        // DO SOMETHING WITH LIST OF NEARBY USERS
        // Need to limit #users sent back
        sortUsers(users, preferences).then(function (sortedUsers) {
          res.json(sortedUsers);
        });

        // res.json(users);
      }).catch(function (error) {
        console.log(error, 'query ');
        res.json({ error: error });
      });

      // user.Update({'location': })
    }).catch(function (error) {
      console.log(error, 'find one ERROR');
      res.json({ error: error });
    });
  } else {
    console.log("user does not exist");
    res.json("user does not exist");
  }
};

/*eslint-enable*/