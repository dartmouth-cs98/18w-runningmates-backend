import jwt from 'jwt-simple';

import User from '../models/user';
import Chat from '../models/chats';
import config from '../config';

const maxUsers = 15;

// update potentialMates
// update mates

export const match = (req, res, next) => {
  const targetId = req.body.targetId;
  const userId = req.user._id.toString();
  console.log('User ID is: ', userId);
  const time = Date.now();
  User.findOne({ _id: targetId })
  .then((found) => {
    if (found) {
      // console.log(found);
      // if its a match
      if (userId in found.potentialMates) {
        // updated current active user
        User.findOne({ _id: userId })
        .then((foundActive) => {
          if (foundActive) {
            const userMates = foundActive.mates || {};
            const userRequestsReceived = foundActive.requestsReceived || {};
            const userActivePotentialMates = foundActive.potentialMates || {};
            if (targetId in userRequestsReceived) {
              delete userRequestsReceived[targetId];
            }
            if (targetId in userActivePotentialMates) {
              delete userActivePotentialMates[targetId];
            }
            userMates[targetId] = time;
            User.update({ _id: userId },
              {
                mates: userMates,
                requestsReceived: userRequestsReceived,
                potentialMates: userActivePotentialMates,
              }).then((user) => {
                res.send({ response: 'match' });
                // update user they matched with
                // delete from potentials (requests sent)
                const targetPotentialMates = found.potentialMates || {};
                const targetRequestsReceived = found.requestsReceived || {};

                if (userId in targetPotentialMates) {
                  delete targetPotentialMates[userId];
                }
                if (userId in targetRequestsReceived) {
                  delete targetRequestsReceived[userId];
                }
                // mates
                const targetMates = found.mates;
                targetMates[userId] = foundActive;
                // update
                User.update({ _id: targetId },
                  {
                    mates: targetMates,
                    potentialMates: targetPotentialMates,
                    requestsReceived: targetRequestsReceived,
                  }).then((targetUser) => {
                    // create a new Chat with both users in it
                    const newChat = new Chat();
                    newChat.members = [targetId, userId];
                    newChat.mostRecentMessage = 'You matched!';
                    newChat.lastUpdated = Date.now();
                    newChat.save().then(() => {
                      console.log('saved new chat for match');
                    }).catch((err) => {
                      console.log('error creating new chat for match');
                      console.log(err);
                    });
                    console.log('successfully updated user');
                  // res.send('updated user');
                  }).catch((error) => {
                    console.log('error updating user');
                    console.log(error);
                  // res.status(500).json({error});
                  });
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
      } else { // Not mutual...yet
        res.send({ response: 'no' });
        // update active user

        const foundRequestsReceived = found.requestsReceived || {};

        if (!(userId in foundRequestsReceived)) {
          foundRequestsReceived[userId] = time;
        }

        // update found user's received requests
        User.update({ _id: targetId },
          {
            requestsReceived: foundRequestsReceived,
          }).then((user) => {
            User.findOne({ _id: userId })
            .then((foundPotential) => {
              if (foundPotential) {
                const userPotentialMates = foundPotential.potentialMates;
                userPotentialMates[targetId] = time;
                User.update({ _id: userId },
                  {
                    potentialMates: userPotentialMates,
                  }).then((userPotential) => {
                    console.log('successfully updated user');
                    console.log(userPotential);
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
          // res.send('updated user');
          }).catch((error) => {
            console.log(error);
          // res.status(500).json({error});
          });

        // Update user's requests
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
          res.send({ token: tokenForUser(result), user: result });
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

export const signout = (req, res, next) => {
  console.log("signing out");
  req.logout();
  res.json("Success signing out");
}

export const updateUser = (req, res, next) => {

  let update = {};
  // const email = req.body.email;
  const email = req.user.email;
  if (email != req.params.email) {
    return res.status(401).send("Unauthorized");
  }

  for (let key in req.body) {
    update[key] = req.body[key];
  };
  User.findOne({email})
  .then((found) => {
    if (found) {
      User.update({ email }, update).then((user) => {
        res.json('updated user');
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
  const email = req.user.email;

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
  console.log("in updatePrefs");

  const email = req.user.email;

  const gender = req.body.gender;
  const runLength = req.body.runLength;
  const age = req.body.age;
  const proximity = req.body.proximity;

  User.findOne({email})
  .then((found) => {
    if (found) {
      let preferences = found.preferences;

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
          recommendationText = ""
          let user = users[key];
          console.log("Checking user: ", user);
          let userPoints = 0;
          if (sortedUsers.length >= maxUsers) {
            break;
          }

          if (activeUser._id in user.mates) {
            continue;
          }

          if (activeUser.email == user.email) {
            continue;
          }
          // Sort by gender

          if (!(typeof user.gender === "undefined") && !(typeof activeUser.preferences.gender === "undefined")) {
            let genderPref = activeUser.preferences.gender.join('|').toLowerCase().split('|');

            if (!genderPref.includes(user.gender.toLowerCase())) {
                continue;
            };
          }


          // If not in age range
          if ((activeUser.preferences.age[1] < user.age) || (activeUser.preferences.age[0] > user.age)) {
              continue;
            }

          // Check which if any desired goals are the same
          if ('desiredGoals' in activeUser && ('desiredGoals' in user )) {
            for (let index in user.desiredGoals) {
              let goal = user.desiredGoals[index];
              if (activeUser.desiredGoals.includes(goal)){
                userPoints += 10;
                if (recommendationText == "") {
                  recommendationText = `You both are looking for ${goal}`;
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

            if (('averageRunLength' in activeUser.data) && ('averageRunLength' in user.data)) {

              /*
              If potential match's average run length is in user pref range,
              add: 10 Points
              */
              if ((user.data.averageRunLength >= activeUser.preferences.runLength[0]) && (user.data.averageRunLength <= activeUser.preferences.runLength[1])) {
                userPoints += 10;

                if (recommendationText == "") {
                  recommendationText = `${user.firstName}'s average run length is in your preferred range'`;
                }

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
                  if (recommendationText == "") {
                    recommendationText = `${user.firstName}'s average run length is slightly below your preferred average run length range`;
                  }

                }

                else {
                  lengthDifference = activeUser.preferences.runLength[1] - user.data.averageRunLength
                  userPoints += (10 + (1.5 * user.data.averageRunLength));
                  if (recommendationText == "") {
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
                if (recommendationText == "") {
                  recommendationText = `${user.firstName}'s average run length is the same as your average run length`;
                }
              }
              else if  (user.data.averageRunLength < activeUser.data.averageRunLength){
                let runningLengthDifference = activeUser.data.averageRunLength - user.data.averageRunLength
                userPoints += (10 + (2 * runningLengthDifference));
                if (recommendationText == "") {
                  recommendationText = `${user.firstName}'s average run length is slightly below your average run length`;
                }
              }
              else {
                let runningLengthDifference = user.data.averageRunLength - activeUser.data.averageRunLength
                userPoints += (10 - (2 * runningLengthDifference));
                if (recommendationText == "") {
                  recommendationText = `${user.firstName}'s average run length is slightly above your average run length`;
                }
              }
            }


            /*
            ------------------------------------
            Runs Per Week Check
            ------------------------------------
            */

            if (('runsPerWeek' in activeUser.data) && ('runsPerWeek' in user.data)) {
              if (user.data.runsPerWeek === activeUser.data.runsPerWeek){
                userPoints += 10;
                if (recommendationText == "") {
                  recommendationText = `${user.firstName}'s runs per week is equal to your runs per week`;
                }
              }
              else if  (user.data.runsPerWeek < activeUser.data.runsPerWeek){
                let runsCountDifference = activeUser.data.runsPerWeek - user.data.runsPerWeek
                userPoints += (10 + (3 * runsCountDifference));
                if (recommendationText == "") {
                  recommendationText = `${user.firstName}'s runs per week is slightly below your runs per week`;
                }
              }
              else {
                let runsCountDifference = user.data.runsPerWeek - activeUser.data.runsPerWeek
                userPoints += (10 - (3 * runsCountDifference));
                if (recommendationText == "") {
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
          // console.log("------MATCH REASON------")
          // console.log(user);
          // console.log(recommendationText);

          if (recommendationText == undefined) {
            recommendationText = "";
          }

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
        // console.log(limitedUsersIndex[i])
        sortedLimitedUsers.push(sortedUsers[index]);
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
  const email = req.query.email;

  User.findOne({"email": email})
  .then((user) => {
    res.json(user);
  })
  .catch((error) => {
    res.json({ error });
  });

};

export const getFriendRequestUsers = (req, res) => {
  console.log('made call', req.user);
  const usersRequesting = req.user.requestsReceived;
  const idsArray = Object.keys(usersRequesting);
  User.find().friendRequests(idsArray)
  .then((users) => {
    console.log('found friend requests', users);
    res.json(users);
  })
  .catch((error) => {
    console.log('error in friend requesting', errors);
    res.json({ error });
  });

};

export const getUsers = (req, res) => {

  // if (('location' in req.query) && ('email' in req.query)) {
    // let email = req.query.email;
    // let location = req.query.location;
    let email = req.query.email;
    let location = req.query.location;
    let maxDistance = req.query.maxDistance;

    User.findOne({'email': email})
    .then((user) => {
      // console.log('USER IN GETUSERS: ', user);
      let preferences = user.preferences;
      // Needs to be meters, convert from preferences.proximity
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
          res.json(error);
        })
        // res.json(users);
      })
      .catch((error) => {
        res.json({ error });
      });

      // user.Update({'location': })
    })
    .catch((error) => {
      res.json({ error });
    });
  // } else {
  //   res.json("user does not exist");
  // }
};

export const getProfile = (req, res) => {

}


/*eslint-enable*/
