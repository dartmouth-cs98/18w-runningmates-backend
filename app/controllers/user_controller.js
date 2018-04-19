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
  let update = {};
  const email = req.body.email;

  for (let key in req.body) {
    update[key] = req.body[key];
  };
  User.findOne({email})
  .then((found) => {
    if (found) {
      User.update({ email }, update).then((user) => {
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

export const profileUpdate = (req, res, next) => {
  const email = req.body.email;
  const firstName = req.body.firstName;
  //const imageURL = req.body.imageURL;
  const bio = req.body.bio;
  //const gender = req.body.gender;
  //const age = req.body.age;
  const location = req.body.location;
  //const preferences = req.body.preferences;
  const milesPerWeek = req.body.milesPerWeek;
  const totalElevation = req.body.totalElevation;
  const totalMiles = req.body.totalMiles;
  const longestRun = req.body.longestRun;
  const racesDone = req.body.racesDone;
  const runsPerWeek = req.body.runsPerWeek;
  const kom = req.body.kom;
  const frequentSegments = req.body.frequentSegments;


  User.findOne({email})
  .then((found) => {
    if (found) {
      User.update({ email },
      {
        firstName: firstName,
        bio: bio,
        location: location,
        data: {
          milesPerWeek: milesPerWeek,
          totalElevation: totalElevation,
          totalMiles: totalMiles,
          longestRun: longestRun,
          racesDone: racesDone,
          runsPerWeek: runsPerWeek
        }
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



export const updatePrefs = (req, res, next) => {
  const email = req.body.email;
  const gender = req.body.gender;
  const runLength = req.body.runLength;
  const age = req.body.age;
  const proximity = req.body.proximity;

  User.findOne({email})
  .then((found) => {
    if (found) {
      let preferences = found.preferences;
      console.log("found user with following preferences: ");
      console.log(preferences);
      preferences.gender = gender;
      preferences.runLength = runLength;
      preferences.age = age;
      preferences.proximity = proximity;
      User.update({ email },
      {
        preferences: preferences,
      }).then((user) => {
        console.log("successfully updated user preferences");
        res.send('updated user preferences');
      }).catch((error) => {
        console.log("error updating user preferences");
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
casual runnning partners
meet new friends
up for anything
more than friends
training buddy
*/

function sortUsers(activeUser, users, preferences) {
  let sortedUsers =[];

  let strava, nike, appleHealthKit, recommendationText;
  if (activeUser.hasOwnProperty('thirdPartyIds')) {
    if ("strava" in activeUser.thirdPartyIds) {
      strava === true;
    }
    if ("nike" in activeUser.thirdPartyIds) {
      nike === true;
    }
    if ("appleHealthKit" in activeUser.thirdPartyIds) {
      appleHealthKit === true;
    }
  }
  return new Promise((fulfill, reject) => {
      for (let key in users) {
          let user = users[key];
          let userPoints = 0;
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
              console.log("not in age range");
              continue;
            }

          // Check which if any desired goals are the same
          if ('desiredGoals' in activeUser && ('desiredGoals' in user )) {
            for (let index in user.desiredGoals) {
              let goal = user.desiredGoals[index];
              console.log(goal);
              if (activeUser.desiredGoals.includes(goal)){
                userPoints += 10;

                if (recommendationText == undefined) {
                  recommendationText = `You both want to ${goal}`;
                }
              }
            }
          }

          if (('data' in activeUser) && ('data' in user)) {

            /*
            ------------------------------------
            Average Run Length Preferences Check
            ------------------------------------
            */

            if (('averageRunLength' in activeUser) && ('averageRunLength' in user)) {

              /*
              If potential match's average run length is in user pref range,
              add: 10 Points
              */
              if ((user.data.averageRunLength >= activeUser.preferences.runLength[0]) && (user.data.averageRunLength <= activeUser.preferences.runLength[1])) {
                userPoints += 10;

                if (recommendationText == undefined) {
                  recommendationText = `${user.firstName}'s average run length is in your preferred range'`;
                }
                console.log('added average run length for', user.email);

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
                  if (recommendationText == undefined) {
                    recommendationText = `${user.firstName}'s average run length is slightly below your preferred average run length range`;
                  }

                  console.log('added average run length for', user.email);

                }

                else {
                  lengthDifference = activeUser.preferences.runLength[1] - user.data.averageRunLength
                  userPoints += (10 + (1.5 * user.data.averageRunLength));
                  if (recommendationText == undefined) {
                    recommendationText = `${user.firstName}'s average run length is slightly above your preferred average run length range`;
                  }

                }
              }

              /*
              ------------------------------------
              Personal Run Length Check
              ------------------------------------
              */

              if (user.data.averageRunLength === activeUser.data.averageRunLength){
                userPoints += 10;
                if (recommendationText == undefined) {
                  recommendationText = `${user.firstName}'s average run length is the same as your average run length`;
                }
              }
              else if  (user.data.averageRunLength < activeUser.data.averageRunLength){
                let runningLengthDifference = activeUser.data.averageRunLength - user.data.averageRunLength
                userPoints += (10 + (2 * runningLengthDifference));
                if (recommendationText == undefined) {
                  recommendationText = `${user.firstName}'s average run length is slightly below your average run length`;
                }
              }
              else {
                let runningLengthDifference = user.data.averageRunLength - activeUser.data.averageRunLength
                userPoints += (10 - (2 * runningLengthDifference));
                if (recommendationText == undefined) {
                  recommendationText = `${user.firstName}'s average run length is slightly above your average run length`;
                }
              }
            }


            /*
            ------------------------------------
            Runs Per Week Check
            ------------------------------------
            */

            if (('runsPerWeek' in activeUser) && ('runsPerWeek' in user)) {
              if (user.data.runsPerWeek === activeUser.data.runsPerWeek){
                userPoints += 10;
                if (recommendationText == undefined) {
                  recommendationText = `${user.firstName}'s runs per week is equal to your runs per week`;
                }
              }
              else if  (user.data.runsPerWeek < activeUser.data.runsPerWeek){
                let runsCountDifference = activeUser.data.runsPerWeek - user.data.runsPerWeek
                userPoints += (10 + (3 * runsCountDifference));
                if (recommendationText == undefined) {
                  recommendationText = `${user.firstName}'s runs per week is slightly below your runs per week`;
                }
              }
              else {
                let runsCountDifference = user.data.runsPerWeek - activeUser.data.runsPerWeek
                userPoints += (10 - (3 * runsCountDifference));
                if (recommendationText == undefined) {
                  recommendationText = `${user.firstName}'s runs per week is slightly above your runs per week`;
                }
              }
            }
          }


          // if (user.hasOwnProperty(thirdPartyIds)) {
          //   // Strava Check
          //   if (strava && ('strava' in user.thirdPartyIds)) {
          //
          //   }
          //   // Nike check
          //   if (nike && ('nike' in user.thirdPartyIds)) {
          //
          //   }
          //   // Apple Health Kit Check
          //   if (appleHealthKit && ('appleHealthKit' in user.thirdPartyIds)) {
          //
          //   }
          // }
          sortedUsers.push({user: user, matchReason: recommendationText, score: userPoints});


      };

      if (sortedUsers.length < 1){
        console.log('FAILED ADDING USERS');
        reject("We couldn't find people in your area to fit your preferences.");
      }

      let sortedUsersIndexes = Object.keys(sortedUsers).sort(function(a,b){return a.score - b.score});

      let limitedUsersIndex = sortedUsersIndexes.slice(0, maxUsers);
      let sortedLimitedUsers = [];
      for (let i in limitedUsersIndex){
        let index = Number(limitedUsersIndex[i]);
        sortedLimitedUsers.push(sortedUsers[index]);
        console.log(sortedUsers[index].user.email, sortedUsers[index].matchReason, sortedUsers[index].score );
      }
      fulfill(sortedLimitedUsers);

});
}
// Manage sending back users
/*
  To get a list of users sorted by preferences, body must have parameters: location,
  id
*/

export const getUser = (req, res) => {
  const email = req.body.email;
  // console.log("email: " + email);
  User.findOne({"email": email})
  .then((user) => {
    // console.log("FOUND USER:")
    // console.log(user)
    // console.log("---------")
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
      // console.log('USER IN GETUSERS: ', user);
      let preferences = user.preferences;

      // IN METERS
      let maxDistance = 10000; // Needs to be meters, convert from preferences.proximity
      // location needs to be an array of floats [<long>, <lat>]
      let query = User.find();
      query.where('location').near({ center: {type: 'Point', coordinates: location}, maxDistance: maxDistance, spherical: true })

      .then((users) =>{
        // DO SOMETHING WITH LIST OF NEARBY USERS
        // Users Limited by MaxUsers
        sortUsers(user, users, preferences)
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

export const getProfile = (req, res) => {

}


/*eslint-enable*/
