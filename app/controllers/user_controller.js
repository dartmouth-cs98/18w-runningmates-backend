import jwt from 'jwt-simple';

import User from '../models/user';
import config from '../config';


// encodes a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

export const signin = (req, res, next) => {
  res.send({ token: tokenForUser(req.user), user: req.user });
};


/*eslint-disable*/
export const signup = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log('function was made');
  // Check that there is an email and a password
  if (!email || !password) {
    return res.status(422).send('You must provide email and password');
  }

  // Check if there exists a user with that email
  User.findOne({ email })
  .then((found) => {
    if (!found) {
      const user = new User();
      user.email = email;
      user.password = password;

      user.save()
        .then((result) => {
          res.send({ token: tokenForUser(result) });
        })
        .catch((error) => {
          res.json({ error: 'first one' });
        });
    } else {
      res.json('User already exists');
    }
  })
  .catch((error) => {
    res.json({ error });
  });
};


export const getUsers = (req, res) => {
  User.find()
  .then((users) => {
    // console.log(users);
    res.json(users);
  })
  .catch((error) => {
    res.json({ error });
  });
};
/*eslint-enable*/
