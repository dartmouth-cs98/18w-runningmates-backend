import { Router } from 'express';
import * as Users from './controllers/user_controller';
import * as UserStrava from './controllers/user_strava_controller';
import { requireSignin } from './services/passport';
import signS3 from './services/s3';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to running mates!' });
});

// routes will go here
router.post('/signin', requireSignin, Users.signin);
router.post('/signup', Users.signup);
router.post('/stravaSignUp', UserStrava.getData);
router.post('/users/update', Users.updateUser);
router.get('/sign-s3', signS3);
router.get('/users/:id'); // Get User
router.post('/users/:id'); // Update User
router.get('/users', Users.getUsers); // Get Users


export default router;
