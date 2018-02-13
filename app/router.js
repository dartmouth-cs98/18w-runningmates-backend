import { Router } from 'express';
import * as Users from './controllers/user_controller';
import * as UserStrava from './controllers/user_strava_controller'
import { requireSignin } from './services/passport';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to running mates!' });
});

// routes will go here
router.post('/signin', requireSignin, Users.signin);
router.post('/signup', Users.signup);
router.post('/stravaSignUp', UserStrava.getData);

export default router;
