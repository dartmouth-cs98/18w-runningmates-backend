import jwt from 'jwt-simple';

import User from '../models/user';
import config from '../config';

const maxUsers = 15;
// encodes a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

export const signin = (req, res, next) => {
  console.log('signing in');
  res.send({ token: tokenForUser(req.user), user: req.user });
};


/*eslint-disable*/
export const signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const coords = [-147.349442, 64.751114];

  // Check that there is an email and a password
  if (!email || !password) {
    return res.status(421).send('You must provide email and password');
  }

  // Check if there exists a user with that email
  User.findOne({ email })
  .then((found) => {
    if (!found) {
      const user = new User();
      user.password = password;
      user.email = email;
      user.location = coords;

      // user.location = {"coordinates": coords};

      user.save()
        .then((result) => {
          res.send({ token: tokenForUser(result) });
        })
        .catch((error) => {
          console.log(error);
          res.status(420).send('Error saving user');

        });
    } else {
      res.status(422).send('User already exists');
    }
  })
  .catch((error) => {
    console.log(error);
    res.json({ error });
  });
};

export const updateUser = (req, res, next) => {
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const imageURL = req.body.imageURL;
  const bio = req.body.bio;
  const gender = req.body.gender;
  const age = req.body.age;
  const location = req.body.location;
  const preferences = req.body.preferences;

  User.findOne({email})
  .then((found) => {
    if (found) {
      User.update({ email },
      {
        firstName: firstName,
        lastName: lastName,
        imageURL: imageURL,
        bio: bio,
        gender: gender,
        age: age,
        location: location,
        preferences: preferences,
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


/*
Helper sorting function to create a sorted list of users with their reason for matching.
Inputs: Users - list of users nearby; Preferences - User's preferences
Output: sortedUsers - [{userObject, matchReasonString}] - The sorted list of users based on a specific user's preferenceså
*/
function sortUsers(users, preferences) {
  let sortedUsers =[];
  console.log(users);
  return new Promise((fulfill, reject) => {
      for (let key in users) {
          user = users[key]
          console.log(user);
          if (sortedUsers.length >= maxUsers) {
            break;
          }
          // Sort by gender
          if ((preferences.gender == "Female") || (preferences.gender == "Male")) {
            if (user.gender !==  preferences.gender) {
              continue;
            }
          };

          // If not in age range
          if (!(preferences.age[0] < user.age) || !(preferences.age[1] > user.age)) {
              continue;
            }

          // Conditional for pace here
          sortedUsers.push({user: user, matchReason: "They're totally rad, brah."});
      };

      if (sortedUsers.length < 1){
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
export const getUsers = (req, res) => {

  if (('location' in req.query) && ('email' in req.query)) {
    let email = req.query.email;
    let location = req.query.location;
    User.findOne({'email': email})
    .then((user) => {
      console.log('user: ', user.preferences);
      let preferences = user.preferences;

      // IN METERS
      let maxDistance = 10000; // Needs to be meters, convert from preferences.proximity
      // location needs to be an array of floats [<long>, <lat>]
      let query = User.find();
      query.where('location').near({ center: {type: 'Point', coordinates: location}, maxDistance: maxDistance, spherical: true })

      .then((users) =>{
        // DO SOMETHING WITH LIST OF NEARBY USERS
        // Need to limit #users sent back
        sortUsers(users, preferences)
        .then((sortedUsers) => {
          res.json(sortedUsers);
        })
        .catch((error))

        // res.json(users);
      })
      .catch((error) => {
        console.log(error, 'query ');
        res.json({ error });
      });

      // user.Update({'location': })
    })
    .catch((error) => {
      console.log(error, 'find one ERROR');
      res.json({ error });
    });
  } else {
    console.log("user does not exist");
    res.json("user does not exist");
  }
};


/*eslint-enable*/
