'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getProfile = exports.getUsers = exports.getUser = exports.updatePrefs = exports.profileUpdate = exports.updateUser = exports.signup = exports.signin = exports.match = undefined;

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var maxUsers = 15;

// update potentialMates
// update mates

var match = exports.match = function match(req, res, next) {
  var targetId = req.body.targetId;
  var userId = req.body.userId;
  console.log('targetId: ' + targetId);
  console.log('userId: ' + userId);

  _user2.default.findOne({ _id: targetId }).then(function (found) {
    if (found) {
      console.log(found);
      // if its a match
      if (found.potentialMates.includes(userId)) {
        res.send({ response: 'match' });
        // updated current active user
        _user2.default.findOne({ _id: userId }).then(function (foundActive) {
          if (foundActive) {
            var userMates = found.mates;
            userMates.push(targetId);
            _user2.default.update({ _id: userId }, {
              mates: userMates
            }).then(function (user) {
              console.log('successfully updated mates ');
              // res.send('updated user');
            }).catch(function (error) {
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
        var targetPotentialMates = found.potentialMates;
        var index = targetPotentialMates.indexOf(userId);
        if (index !== -1) {
          targetPotentialMates.splice(index, 1);
        }
        // mates
        var targetMates = found.mates;
        targetMates.push(userId);
        // update
        _user2.default.findOne({ _id: targetId }).then(function (foundUpdate) {
          if (foundUpdate) {
            _user2.default.update({ _id: targetId }, {
              mates: targetMates,
              potentialMates: targetPotentialMates
            }).then(function (user) {
              console.log('successfully updated user');
              // res.send('updated user');
            }).catch(function (error) {
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

        _user2.default.findOne({ _id: userId }).then(function (foundPotential) {
          if (foundPotential) {
            var userPotentialMates = found.potentialMates;
            userPotentialMates.push(targetId);
            _user2.default.update({ _id: userId }, {
              potentialMates: userPotentialMates
            }).then(function (user) {
              console.log('successfully updated user');
              console.log(user);
              // res.send('updated user');
            }).catch(function (error) {
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
  var timestamp = new Date().getTime();
  return _jwtSimple2.default.encode({ sub: user.id, iat: timestamp }, _config2.default.secret);
}

var signin = exports.signin = function signin(req, res, next) {
  console.log('signing in');
  res.send({ token: tokenForUser(req.user), user: req.user });
};

/*eslint-disable*/
var signup = exports.signup = function signup(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var coords = [-147.349442, 64.751114];

  // Check that there is an email and a password
  if (!email || !password) {
    return res.status(421).send('You must provide email and password');
  }

  // Check if there exists a user with that email
  _user2.default.findOne({ email: email }).then(function (found) {
    if (!found) {
      var user = new _user2.default();
      user.password = password;
      user.email = email;

      // user.location = {"coordinates": coords};

      user.save().then(function (result) {
        res.send({ token: tokenForUser(result) });
      }).catch(function (error) {
        console.log(error);
        res.status(420).send('Error saving user');
      });
    } else {
      res.status(422).send('User already exists');
    }
  }).catch(function (error) {
    console.log(error);
    res.json({ error: error });
  });
};

var updateUser = exports.updateUser = function updateUser(req, res, next) {
  var update = {};
  var email = req.body.email;

  for (var key in req.body) {
    update[key] = req.body[key];
  };
  _user2.default.findOne({ email: email }).then(function (found) {
    if (found) {
      _user2.default.update({ email: email }, update).then(function (user) {
        res.send('updated user');
      }).catch(function (error) {
        console.log("error updating user");
        console.log(error);
        res.status(500).json({ error: error });
      });
    } else {
      console.log("user does not exist");
      res.json("User does not exist");
    }
  });
};

var profileUpdate = exports.profileUpdate = function profileUpdate(req, res, next) {
  var email = req.body.email;
  var firstName = req.body.firstName;
  //const imageURL = req.body.imageURL;
  var bio = req.body.bio;
  //const gender = req.body.gender;
  //const age = req.body.age;
  var location = req.body.location;
  //const preferences = req.body.preferences;
  var milesPerWeek = req.body.milesPerWeek;
  var totalElevation = req.body.totalElevation;
  var totalMiles = req.body.totalMiles;
  var longestRun = req.body.longestRun;
  var racesDone = req.body.racesDone;
  var runsPerWeek = req.body.runsPerWeek;
  var kom = req.body.kom;
  var frequentSegments = req.body.frequentSegments;

  _user2.default.findOne({ email: email }).then(function (found) {
    if (found) {
      _user2.default.update({ email: email }, {
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
      }).then(function (user) {
        console.log("successfully updated user");
        res.send('updated user');
      }).catch(function (error) {
        console.log("error updating user");
        console.log(error);
        res.status(500).json({ error: error });
      });
    } else {
      console.log("user does not exist");
      res.json("User does not exist");
    }
  });
};

var updatePrefs = exports.updatePrefs = function updatePrefs(req, res, next) {
  var email = req.body.email;
  var gender = req.body.gender;
  var runLength = req.body.runLength;
  var age = req.body.age;
  var proximity = req.body.proximity;

  _user2.default.findOne({ email: email }).then(function (found) {
    if (found) {
      var preferences = found.preferences;
      console.log("found user with following preferences: ");
      console.log(preferences);
      preferences.gender = gender;
      preferences.runLength = runLength;
      preferences.age = age;
      preferences.proximity = proximity;
      _user2.default.update({ email: email }, {
        preferences: preferences
      }).then(function (user) {
        console.log("successfully updated user preferences");
        res.send('updated user preferences');
      }).catch(function (error) {
        console.log("error updating user preferences");
        console.log(error);
        res.status(500).json({ error: error });
      });
    } else {
      console.log("user does not exist");
      res.json("User does not exist");
    }
  });
};

function stravaMatchingCheck(activeUser, potentialUser) {}
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
  var sortedUsers = [];

  var strava = void 0,
      nike = void 0,
      appleHealthKit = void 0,
      recommendationText = void 0;
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
  return new Promise(function (fulfill, reject) {
    for (var key in users) {
      var user = users[key];
      var userPoints = 0;
      if (sortedUsers.length >= maxUsers) {
        break;
      }

      if (activeUser.email == user.email) {
        continue;
      }
      // Sort by gender
      if (preferences.gender == "Female" || preferences.gender == "Male") {
        if (user.gender !== preferences.gender) {
          continue;
        }
      };

      // If not in age range
      if (!(preferences.age[0] <= user.age) || !(preferences.age[1] >= user.age)) {
        console.log("not in age range");
        continue;
      }

      console.log('should be true: ', "desiredGoals" in activeUser);
      console.log('should be true data: ', "data" in activeUser);

      // Check which if any desired goals are the same
      if ('desiredGoals' in activeUser && 'desiredGoals' in user) {
        for (var index in user.desiredGoals) {
          var goal = user.desiredGoals[index];
          console.log(goal);
          if (activeUser.desiredGoals.includes(goal)) {
            userPoints += 10;

            if (recommendationText == undefined) {
              recommendationText = 'You both want to ' + goal;
            }
            console.log("added desired goal for", user);
          }
        }
      }

      if ('data' in activeUser && 'data' in user) {

        /*
        ------------------------------------
        Average Run Length Preferences Check
        ------------------------------------
        */

        if ('averageRunLength' in activeUser && 'averageRunLength' in user) {

          /*
          If potential match's average run length is in user pref range,
          add: 10 Points
          */
          if (user.data.averageRunLength >= activeUser.preferences.runLength[0] && user.data.averageRunLength <= activeUser.preferences.runLength[1]) {
            userPoints += 10;

            if (recommendationText == undefined) {
              recommendationText = user.firstName + '\'s average run length is in your preferred range\'';
            }
            console.log('added average run length for', user);
          }

          /*
          Else based on difference to closest part of range, apply state-of-art formulas for determining accurate amount of points
          add: 10 Points
          */

          else {
              var lengthDifference = void 0;
              if (user.data.averageRunLength < activeUser.preferences.runLength[0]) {
                lengthDifference = activeUser.preferences.runLength[0] - user.data.averageRunLength;
                userPoints += 10 - 3 * user.data.averageRunLength;
                if (recommendationText == undefined) {
                  recommendationText = user.firstName + '\'s average run length is slightly below your preferred average run length range';
                }

                console.log('added average run length for', user);
              } else {
                lengthDifference = activeUser.preferences.runLength[1] - user.data.averageRunLength;
                userPoints += 10 + 1.5 * user.data.averageRunLength;
                if (recommendationText == undefined) {
                  recommendationText = user.firstName + '\'s average run length is slightly above your preferred average run length range';
                }
              }
            }

          /*
          ------------------------------------
          Personal Run Length Check
          ------------------------------------
          */

          if (user.data.averageRunLength === activeUser.data.averageRunLength) {
            userPoints += 10;
            if (recommendationText == undefined) {
              recommendationText = user.firstName + '\'s average run length is the same as your average run length';
            }
          } else if (user.data.averageRunLength < activeUser.data.averageRunLength) {
            var runningLengthDifference = activeUser.data.averageRunLength - user.data.averageRunLength;
            userPoints += 10 + 2 * runningLengthDifference;
            if (recommendationText == undefined) {
              recommendationText = user.firstName + '\'s average run length is slightly below your average run length';
            }
          } else {
            var _runningLengthDifference = user.data.averageRunLength - activeUser.data.averageRunLength;
            userPoints += 10 - 2 * _runningLengthDifference;
            if (recommendationText == undefined) {
              recommendationText = user.firstName + '\'s average run length is slightly above your average run length';
            }
          }
        }

        /*
        ------------------------------------
        Runs Per Week Check
        ------------------------------------
        */

        if ('runsPerWeek' in activeUser && 'runsPerWeek' in user) {
          if (user.data.runsPerWeek === activeUser.data.runsPerWeek) {
            userPoints += 10;
            if (recommendationText == undefined) {
              recommendationText = user.firstName + '\'s runs per week is equal to your runs per week';
            }
          } else if (user.data.runsPerWeek < activeUser.data.runsPerWeek) {
            var runsCountDifference = activeUser.data.runsPerWeek - user.data.runsPerWeek;
            userPoints += 10 + 3 * runsCountDifference;
            if (recommendationText == undefined) {
              recommendationText = user.firstName + '\'s runs per week is slightly below your runs per week';
            }
          } else {
            var _runsCountDifference = user.data.runsPerWeek - activeUser.data.runsPerWeek;
            userPoints += 10 - 3 * _runsCountDifference;
            if (recommendationText == undefined) {
              recommendationText = user.firstName + '\'s runs per week is slightly above your runs per week';
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
      sortedUsers.push({ user: user, matchReason: recommendationText, score: userPoints });
    };

    if (sortedUsers.length < 1) {
      console.log('FAILED ADDING USERS');
      reject("We couldn't find people in your area to fit your preferences.");
    }

    var sortedUsersIndexes = Object.keys(sortedUsers).sort(function (a, b) {
      return a.score - b.score;
    });

    var limitedUsersIndex = sortedUsersIndexes.slice(0, maxUsers);
    var sortedLimitedUsers = [];
    for (var i in limitedUsersIndex) {
      var _index = limitedUsersIndex[i];
      sortedLimitedUsers.push(sortedUsers[parseInt(_index)]);
    }
    fulfill(sortedLimitedUsers);
  });
}
// Manage sending back users
/*
  To get a list of users sorted by preferences, body must have parameters: location,
  id
*/

var getUser = exports.getUser = function getUser(req, res) {
  var email = req.body.email;
  // console.log("email: " + email);
  _user2.default.findOne({ "email": email }).then(function (user) {
    // console.log("FOUND USER:")
    // console.log(user)
    // console.log("---------")
    res.json(user);
  }).catch(function (error) {
    console.log(error, 'find one ERROR');
    res.json({ error: error });
  });
};

var getUsers = exports.getUsers = function getUsers(req, res) {

  if ('location' in req.query && 'email' in req.query) {
    var email = req.query.email;
    var location = req.query.location;
    _user2.default.findOne({ 'email': email }).then(function (user) {
      // console.log('USER IN GETUSERS: ', user);
      var preferences = user.preferences;

      // IN METERS
      var maxDistance = 10000; // Needs to be meters, convert from preferences.proximity
      // location needs to be an array of floats [<long>, <lat>]
      var query = _user2.default.find();
      query.where('location').near({ center: { type: 'Point', coordinates: location }, maxDistance: maxDistance, spherical: true }).then(function (users) {
        // DO SOMETHING WITH LIST OF NEARBY USERS
        // Users Limited by MaxUsers
        sortUsers(user, users, preferences).then(function (sortedUsers) {
          res.json(sortedUsers);
        }).catch(function (error) {
          console.log('sorting error: ', error);
          res.json(error);
        });
        // res.json(users);
      }).catch(function (error) {
        console.log(error, 'query ');
        res.json({ error: error });
      });

      // user.Update({'location': })
    }).catch(function (error) {
      console.log(error, 'find one ERROR');
      res.json({ error: error });
    });
  } else {
    console.log("user does not exist");
    res.json("user does not exist");
  }
};

var getProfile = exports.getProfile = function getProfile(req, res) {};

/*eslint-enable*/