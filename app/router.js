import { Router } from 'express';
import * as Users from './controllers/user_controller';
import * as UserStrava from './controllers/user_strava_controller';
import * as Chat from './controllers/chat_controller';
import { requireAuth, requireSignin } from './services/passport';
import signS3 from './services/s3';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to running mates!' });
});

// routes will go here
router.route('/signin')
  .post(requireSignin, Users.signin);

router.route('/signup')
  .post(Users.signup);

router.route('/signout')
  .post(requireAuth, Users.signout);

// router.get('/stravaAuthenticate', UserStrava.getStravaRedirect);
// router.get('/stravaSignUp', UserStrava.getStravaToken);
router.route('/stravaSignUp')
  .post(UserStrava.getData);

router.route('/matchingSegments')
  .post(UserStrava.getMatchingSegments);


// router.post('/users/update', Users.updateUser);
router.route('/sign-s3')
  .post(signS3);

router.route('/users/:email')
  .get(Users.getUser) // Get User
  .post(requireAuth, Users.updateUser); // Update User


router.route('/users')
  .get(requireAuth, Users.getUsers); // Get Users
// router.route('/prefs')
//   .post(requireAuth, Users.updatePrefs);
router.route('/match')
  .post(requireAuth, Users.match);
router.route('/chatHistory')
  .get(requireAuth, Chat.getChatHistory);
router.route('/chats')
  .get(requireAuth, Chat.getChatsList);
// below isnt working
// router.post('/stavaUser', UserStrava.getAthlete); //in body have the strava id


export default router;
