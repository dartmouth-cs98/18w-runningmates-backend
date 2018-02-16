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
  if (!username || !password) {
    return res.status(422).send('You must provide username and password');
  }

  // Check if there exists a user with that email
  User.findOne({ username })
  .then((found) => {
    if (!found) {
      const user = new User();
      user.username = username;
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

// Manage sending back users
/*
  To get a list of users sorted by preferences, body must have parameters: location,
  id
*/
export const getUsers = (req, res) => {
  if (('location' in req.body) && ('id' in req.body.id)) {
    let id = req.body.id;
    let location = req.body.location;
    User.findOne({'id': id})
    .then((user) => {
      console.log(user);
      preferences = user.preferences;

      let maxDistance = user.preferences // Needs to be meters, convert from preferences.maxDistance
      // location needs to be an array of floats [<long>, <lat>]
      User.find({
        loc: {
          $near: location,
          $maxDistance: maxDistance
        }
      })
      .then((users) =>{
        // DO SOMETHING WITH LIST OF NEARBY USERS
        // Need to limit #users sent back
        res.json(users);
      })
      .catch((error) => {
        res.json({ error });
      });

      // user.Update({'location': })
    })
    .catch((error) => {
      res.json({ error });
    });
  }
};


/*eslint-enable*/
