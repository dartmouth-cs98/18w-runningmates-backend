'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUsers = exports.signup = exports.signin = undefined;

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

      user.save().then(function (result) {
        res.send({ token: tokenForUser(result) });
      }).catch(function (error) {
        res.json({ error: 'first one' });
      });
    } else {
      res.json('User already exists');
    }
  }).catch(function (error) {
    res.json({ error: error });
  });
};

var getUsers = exports.getUsers = function getUsers(req, res) {
  _user2.default.find().then(function (users) {
    // console.log(users);
    res.json(users);
  }).catch(function (error) {
    res.json({ error: error });
  });
};

/*eslint-enable*/