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
  const email = req.body.email;
  const coords = [64.7511, 147.3494];

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
      user.email = email;
      // user.location = {"coordinates": coords};

      user.save()
        .then((result) => {
          res.send({ token: tokenForUser(result) });
        })
        .catch((error) => {
          console.log(error);
          res.json({ error: 'first one' });
        });
    } else {
      console.log("already exists");
      res.json('User already exists');
    }
  })
  .catch((error) => {
    console.log(error);
    res.json({ error });
  });
};

export const updateUser = (req, res, next) => {
  console.log("updating user");

  const username = req.params.username;
  console.log(username);
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const imageURL = req.body.imageURL;
  const bio = req.body.bio;
  const gender = req.body.gender;
  const age = req.body.age;
  const location = req.body.location;

  User.findOne({username})
  .then((found) => {
    if (found) {
      console.log("user exists");
      User.update({ username },
      {
        firstName: firstName,
        lastName: lastName,
        imageURL: imageURL,
        bio: bio,
        gender: gender,
        age: age,
        location: location,
      }).then((user) => {
        console.log("successfully updated user");
        res.send('updated user');
      }).catch((error) => {
        console.log("error updating user");
        console.log(error);
        res.status(500).json({error});
      });
    } else {
      console.log("user does not exist");
      res.json("User does not exist");
    }
  });
}

// Manage sending back users
/*
  To get a list of users sorted by preferences, body must have parameters: location,
  id
*/
export const getUsers = (req, res) => {

  if (('location' in req.body) && ('username' in req.body)) {
    let username = req.body.username;
    let location = req.body.location;
    User.findOne({'username': username})
    .then((user) => {
      console.log(user);
      // preferences = user.preferences;

      // IN METERS
      let maxDistance = 10000; // Needs to be meters, convert from preferences.maxDistance
      // location needs to be an array of floats [<long>, <lat>]
      User.find({
        location: {
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
        console.log(error);
        res.json({ error });
      });

      // user.Update({'location': })
    })
    .catch((error) => {
      console.log(error);
      res.json({ error });
    });
  }
};


/*eslint-enable*/
