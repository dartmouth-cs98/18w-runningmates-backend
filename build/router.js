'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _user_controller = require('./controllers/user_controller');

var Users = _interopRequireWildcard(_user_controller);

var _user_strava_controller = require('./controllers/user_strava_controller');

var UserStrava = _interopRequireWildcard(_user_strava_controller);

var _passport = require('./services/passport');

var _s = require('./services/s3');

var _s2 = _interopRequireDefault(_s);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var router = (0, _express.Router)();

router.get('/', function (req, res) {
  res.json({ message: 'welcome to running mates!' });
});

// routes will go here
router.post('/signin', _passport.requireSignin, Users.signin);
router.post('/signup', Users.signup);

// router.get('/stravaAuthenticate', UserStrava.getStravaRedirect);
// router.get('/stravaSignUp', UserStrava.getStravaToken);
router.post('/stravaSignUp', UserStrava.getData);
// router.post('/users/update', Users.updateUser);
router.get('/sign-s3', _s2.default);
router.get('/users/:email'); // Get User
router.post('/users/:email', Users.updateUser); // Update User
router.get('/users', Users.getUsers); // Get Users
// below isnt working
// router.post('/stavaUser', UserStrava.getAthlete); //in body have the strava id


exports.default = router;