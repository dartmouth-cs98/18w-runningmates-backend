'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _user_controller = require('./controllers/user_controller');

var Users = _interopRequireWildcard(_user_controller);

var _user_strava_controller = require('./controllers/user_strava_controller');

var UserStrava = _interopRequireWildcard(_user_strava_controller);

var _chat_controller = require('./controllers/chat_controller');

var Chat = _interopRequireWildcard(_chat_controller);

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
router.route('/signin').post(_passport.requireSignin, Users.signin);

router.route('/signup').post(Users.signup);

router.route('/signout').post(_passport.requireAuth, Users.signout);

// router.get('/stravaAuthenticate', UserStrava.getStravaRedirect);
// router.get('/stravaSignUp', UserStrava.getStravaToken);
router.route('/stravaSignUp').post(UserStrava.getData);
// router.post('/users/update', Users.updateUser);
router.route('/sign-s3').post(_s2.default);

router.route('/users/:email').get(Users.getUser) // Get User
.post(_passport.requireAuth, Users.updateUser); // Update User

router.route('/users/friendRequests').get(_passport.requireAuth, Users.getFriendRequestUsers);

router.route('/users').get(_passport.requireAuth, Users.getUsers); // Get Users
// router.route('/prefs')
//   .post(requireAuth, Users.updatePrefs);
router.route('/match').post(_passport.requireAuth, Users.match);
router.route('/chatHistory').get(_passport.requireAuth, Chat.getChatHistory);
router.route('/chats').get(_passport.requireAuth, Chat.getChatsList);
// below isnt working
// router.post('/stavaUser', UserStrava.getAthlete); //in body have the strava id


exports.default = router;