import jwt from 'jwt-simple';

import User from '../models/user';
import config from '../config';

const maxUsers = 15;

// update potentialMates
// update mates

export const match = (req, res, next) => {
  const targetId = req.body.targetId;
  const userId = req.body.userId;
  console.log(`targetId: ${targetId}`);
  console.log(`userId: ${userId}`);

  User.findOne({ _id: targetId })
  .then((found) => {
    if (found) {
      console.log(found);
      // if its a match
      if (found.potentialMates.includes(userId)) {
        res.send({ response: 'match' });
        // updated current active user
        User.findOne({ _id: userId })
        .then((foundActive) => {
          if (foundActive) {
            const userMates = found.mates;
            userMates.push(targetId);
            User.update({ _id: userId },
              {
                mates: userMates,
              }).then((user) => {
                console.log('successfully updated mates ');
              // res.send('updated user');
              }).catch((error) => {
                console.log('error updating user');
                console.log(error);
              // res.status(500).json({error});
              });
          } else {
            console.log('user does not exist');
            // res.json("User does not exist");
          }
        });
        // update user they matched with
        // delete from potentials
        const targetPotentialMates = found.potentialMates;
        const index = targetPotentialMates.indexOf(userId);
        if (index !== -1) {
          targetPotentialMates.splice(index, 1);
        }
        // mates
        const targetMates = found.mates;
        targetMates.push(userId);
        // update
        User.findOne({ _id: targetId })
        .then((foundUpdate) => {
          if (foundUpdate) {
            User.update({ _id: targetId },
              {
                mates: targetMates,
                potentialMates: targetPotentialMates,
              }).then((user) => {
                console.log('successfully updated user');
              // res.send('updated user');
              }).catch((error) => {
                console.log('error updating user');
                console.log(error);
              // res.status(500).json({error});
              });
          } else {
            console.log('user does not exist');
            // / res.json("User does not exist");
          }
        });
      } else {
        res.send({ response: 'no' });

        // update active user

        User.findOne({ _id: userId })
        .then((foundPotential) => {
          if (foundPotential) {
            const userPotentialMates = found.potentialMates;
            userPotentialMates.push(targetId);
            User.update({ _id: userId },
              {
                potentialMates: userPotentialMates,
              }).then((user) => {
                console.log('successfully updated user');
                console.log(user);
              // res.send('updated user');
              }).catch((error) => {
                console.log('error updating user');
                console.log(error);
              // res.status(500).json({error});
              });
          } else {
            console.log('user does not exist');
            // res.json("User does not exist");
          }
        });
      }
    } else {
      console.log('user does not exist');
      res.json('User does not exist');
    }
  });
};


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
  const imgUrl = "data:image/jpeg;base64,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";
  const firstName = req.body.email
  const lastName = "."
  const age = 21
  const bio = "Looking for people to run with!";
  const preferences = {
    "gender": "All",
    "pace": [0,10],
    "age": [0,100],
    "proximity": 10000
  }

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
      user.imageURL = imgUrl;
      user.firstName = firstName;
      user.lastName = lastName;
      user.age = age;
      user.bio = bio;
      user.preferences = preferences;
      user.gender = "Gender";

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



function stravaMatchingCheck(activeUser, potentialUser){

}
/*
Helper sorting function to create a sorted list of users with their reason for matching.
Inputs: Users - list of users nearby; Preferences - User's preferences
Output: sortedUsers - [{userObject, matchReasonString, score}] - The sorted list of users based on a specific user's preferences limited by maxUsers limit

Desired Goals:
Casual runnning partners
Meet new friends
Up for anything
More than friends
Training buddy
*/

function sortUsers(activeUser, users, preferences) {
  let sortedUsers =[];
  let strava, nike, appleHealthKit;
  if (activeUser.thirdPartyIds['strava']) {
    strava === true;
  }
  if (activeUser.thirdPartyIds['nike']) {
    nike === true;
  }
  if (activeUser.thirdPartyIds['appleHealthKit']) {
    appleHealthKit === true;
  }
  return new Promise((fulfill, reject) => {
      for (let key in users) {
          let user = users[key]
          let userPoints = 0;
          console.log(user);
          if (sortedUsers.length >= maxUsers) {
            break;
          }

          if (activeUser.email == user.email) {
            continue;
          }
          // Sort by gender
          if ((preferences.gender == "Female") || (preferences.gender == "Male")) {
            if (user.gender !==  preferences.gender) {
              continue;
            }
          };

          // If not in age range
          if (!(preferences.age[0] <= user.age) || !(preferences.age[1] >= user.age)) {
              continue;
            }

          // Check which if any desired goals are the same
          for (let index in activeUser.desiredGoal) {
            let goal = activeUser.desiredGoal[index];
            if (activeUser.desiredGoal.includes(goal)){
              userPoints += 10;
            }
          }


          /*
          ------------------------------------
          Average Run Length Preferences Check
          ------------------------------------
          */
          /*
          If potential match's average run length is in user pref range,
          add: 10 Points
          */
          if ((user.data.averageRunLength >= activeUser.preferences.runLength[0]) && (user.data.averageRunLength <= activeUser.preferences.runLength[1])) {
            userPoints += 10;
          }

          /*
          Else based on difference to closest part of range, apply state-of-art formulas for determining accurate amount of points
          add: 10 Points
          */

          else {
            let lengthDifference;
            if ((user.data.averageRunLength < activeUser.preferences.runLength[0])) {
              lengthDifference = activeUser.preferences.runLength[0] - user.data.averageRunLength
              userPoints += (10 - (3 * user.data.averageRunLength));
            }

            else {
              lengthDifference = activeUser.preferences.runLength[1] - user.data.averageRunLength
              userPoints += (10 + (1.5 * user.data.averageRunLength));

            }
          }
          /*
          ------------------------------------
          Personal Run Length Check
          ------------------------------------
          */
          if (user.data.averageRunLength === activeUser.data.averageRunLength){
            userPoints += 10;
          }
          else if  (user.data.averageRunLength < activeUser.data.averageRunLength){
            let runningLengthDifference = activeUser.data.averageRunLength - user.data.averageRunLength
            userPoints += (10 + (2 * runningLengthDifference));
          }
          else {
            let runningLengthDifference = user.data.averageRunLength - activeUser.data.averageRunLength
            userPoints += (10 - (2 * runningLengthDifference));
          }

          /*
          ------------------------------------
          Runs Per Week Check
          ------------------------------------
          */
          if (user.data.runsPerWeek === activeUser.data.runsPerWeek){
            userPoints += 10;
          }
          else if  (user.data.runsPerWeek < activeUser.data.runsPerWeek){
            let runsCountDifference = activeUser.data.runsPerWeek - user.data.runsPerWeek
            userPoints += (10 + (3 * runsCountDifference));
          }
          else {
            let runsCountDifference = user.data.runsPerWeek - activeUser.data.runsPerWeek
            userPoints += (10 - (3 * runsCountDifference));
          }

          // Strava Check
          if (strava && user.thirdPartyIds['strava']) {

          }
          // Nike check
          if (nike && user.thirdPartyIds['nike']) {

          }
          // Apple Health Kit Check
          if (appleHealthKit && user.thirdPartyIds['appleHealthKit']) {

          }
          sortedUsers.push({user: user, matchReason: "They're totally rad, brah.", score: userPoints});


      };

      if (sortedUsers.length < 1){
        console.log('FAILED ADDING USERS');
        reject("We couldn't find people in your area to fit your preferences.");
      }

      sortedUsers = Object.keys(sortedUsers).sort(function(a,b){return a.score - b.score});
      let limitedUsers = sortedUsers.slice(0, maxUsers);

      console.log(limitedUsers);
      fulfill(limitedUsers);

});
}
// Manage sending back users
/*
  To get a list of users sorted by preferences, body must have parameters: location,
  id
*/

export const getUser = (req, res) => {
  const email = req.body.email;
  console.log("email: " + email);
  User.findOne({'email': email})
  .then((user) => {
    console.log("FOUND USER:")
    console.log(user)
    console.log("---------")
    res.json(user);
  })
  .catch((error) => {
    console.log(error, 'find one ERROR');
    res.json({ error });
  });

};


export const getUsers = (req, res) => {

  if (('location' in req.query) && ('email' in req.query)) {
    let email = req.query.email;
    let location = req.query.location;
    User.findOne({'email': email})
    .then((user) => {
      console.log('USER IN GETUSERS: ', user);
      let preferences = user.preferences;

      // IN METERS
      let maxDistance = 10000; // Needs to be meters, convert from preferences.proximity
      // location needs to be an array of floats [<long>, <lat>]
      let query = User.find();
      query.where('location').near({ center: {type: 'Point', coordinates: location}, maxDistance: maxDistance, spherical: true })

      .then((users) =>{
        // DO SOMETHING WITH LIST OF NEARBY USERS
        // Users Limited by MaxUsers
        sortUsers(activeUser, users, preferences)
        .then((sortedUsers) => {
          res.json(sortedUsers);
        })
        .catch((error) => {
          console.log('sorting error: ', error);
          res.json(error);
        })
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
