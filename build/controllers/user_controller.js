'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getProfile = exports.getUsers = exports.getFriendRequestUsers = exports.getUser = exports.updatePrefs = exports.profileUpdate = exports.updateUser = exports.signout = exports.signup = exports.signin = exports.match = undefined;

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _chats = require('../models/chats');

var _chats2 = _interopRequireDefault(_chats);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var maxUsers = 15;

// update potentialMates
// update mates

var match = exports.match = function match(req, res, next) {
  var targetId = req.body.targetId;
  var userId = req.user._id.toString();
  console.log('User ID is: ', userId);
  var time = Date.now();
  _user2.default.findOne({ _id: targetId }).then(function (found) {
    if (found) {
      // console.log(found);
      // if its a match
      if (userId in found.potentialMates) {
        // updated current active user
        _user2.default.findOne({ _id: userId }).then(function (foundActive) {
          if (foundActive) {
            var userMates = foundActive.mates || {};
            var userRequestsReceived = foundActive.requestsReceived || {};
            var userActivePotentialMates = foundActive.potentialMates || {};
            if (targetId in userRequestsReceived) {
              delete userRequestsReceived[targetId];
            }
            if (targetId in userActivePotentialMates) {
              delete userActivePotentialMates[targetId];
            }
            userMates[targetId] = time;
            _user2.default.update({ _id: userId }, {
              mates: userMates,
              requestsReceived: userRequestsReceived,
              potentialMates: userActivePotentialMates
            }).then(function (user) {
              res.send({ response: 'match' });
              // update user they matched with
              // delete from potentials (requests sent)
              var targetPotentialMates = found.potentialMates || {};
              var targetRequestsReceived = found.requestsReceived || {};

              if (userId in targetPotentialMates) {
                delete targetPotentialMates[userId];
              }
              if (userId in targetRequestsReceived) {
                delete targetRequestsReceived[userId];
              }
              // mates
              var targetMates = found.mates;
              targetMates[userId] = foundActive;
              // update
              _user2.default.update({ _id: targetId }, {
                mates: targetMates,
                potentialMates: targetPotentialMates,
                requestsReceived: targetRequestsReceived
              }).then(function (targetUser) {
                // create a new Chat with both users in it
                var newChat = new _chats2.default();
                newChat.members = [targetId, userId];
                newChat.mostRecentMessage = 'You matched!';
                newChat.lastUpdated = Date.now();
                newChat.save().then(function () {
                  console.log('saved new chat for match');
                }).catch(function (err) {
                  console.log('error creating new chat for match');
                  console.log(err);
                });
                console.log('successfully updated user');
                // res.send('updated user');
              }).catch(function (error) {
                console.log('error updating user');
                console.log(error);
                // res.status(500).json({error});
              });
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
      } else {
        // Not mutual...yet
        res.send({ response: 'no' });
        // update active user

        var foundRequestsReceived = found.requestsReceived || {};

        if (!(userId in foundRequestsReceived)) {
          foundRequestsReceived[userId] = time;
        }

        // update found user's received requests
        _user2.default.update({ _id: targetId }, {
          requestsReceived: foundRequestsReceived
        }).then(function (user) {
          _user2.default.findOne({ _id: userId }).then(function (foundPotential) {
            if (foundPotential) {
              var userPotentialMates = foundPotential.potentialMates;
              userPotentialMates[targetId] = time;
              _user2.default.update({ _id: userId }, {
                potentialMates: userPotentialMates
              }).then(function (userPotential) {
                console.log('successfully updated user');
                console.log(userPotential);
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
          // res.send('updated user');
        }).catch(function (error) {
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
    console.log("Error with no email or password", email, password);
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
        console.log("Result: ", result);
        res.send({ token: tokenForUser(result), user: result });
      }).catch(function (error) {
        console.log("HERE ERROR", error);
        res.send(error);
      });
    } else {
      res.send('User already exists');
    }
  }).catch(function (error) {
    console.log("OTHER ERROR", error);
    res.json({ error: error });
  });
};

var signout = exports.signout = function signout(req, res, next) {
  console.log("signing out");
  req.logout();
  res.json("Success signing out");
};

var updateUser = exports.updateUser = function updateUser(req, res, next) {

  var update = {};
  // const email = req.body.email;
  var email = req.user.email;
  if (email != req.params.email) {
    return res.status(401).send("Unauthorized");
  }

  for (var key in req.body) {
    update[key] = req.body[key];
  };
  _user2.default.findOne({ email: email }).then(function (found) {
    if (found) {
      _user2.default.update({ email: email }, update).then(function (user) {
        res.json('updated user');
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
  var email = req.user.email;

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
  console.log("in updatePrefs");

  var email = req.user.email;

  var gender = req.body.gender;
  var runLength = req.body.runLength;
  var age = req.body.age;
  var proximity = req.body.proximity;

  _user2.default.findOne({ email: email }).then(function (found) {
    if (found) {
      var preferences = found.preferences;

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
      recommendationText = "";
      var user = users[key];
      console.log("Checking user: ", user);
      var userPoints = 0;
      if (sortedUsers.length >= maxUsers) {
        break;
      }

      if (user.mates && activeUser._id in user.mates) {
        continue;
      }
      if (activeUser._id in user.mates) {
        continue;
      }

      if (activeUser.email == user.email) {
        continue;
      }
      // Sort by gender

      if (!(typeof user.gender === "undefined") && !(typeof activeUser.preferences.gender === "undefined")) {
        var genderPref = activeUser.preferences.gender.join('|').toLowerCase().split('|');

        if (!genderPref.includes(user.gender.toLowerCase())) {
          continue;
        };
      }

      // If not in age range
      if (activeUser.preferences.age[1] < user.age || activeUser.preferences.age[0] > user.age) {
        continue;
      }

      // Check which if any desired goals are the same
      if ('desiredGoals' in activeUser && 'desiredGoals' in user) {
        for (var index in user.desiredGoals) {
          var goal = user.desiredGoals[index];
          if (activeUser.desiredGoals.includes(goal)) {
            userPoints += 10;
            if (recommendationText == "") {
              recommendationText = 'You both are looking for ' + goal;
            }
          }
        }
      }

      if ('data' in activeUser && 'data' in user) {

        /*
        ------------------------------------
        Average Run Length Preferences Check
        ------------------------------------
        */

        if ('averageRunLength' in activeUser.data && 'averageRunLength' in user.data) {

          /*
          If potential match's average run length is in user pref range,
          add: 10 Points
          */
          if (user.data.averageRunLength >= activeUser.preferences.runLength[0] && user.data.averageRunLength <= activeUser.preferences.runLength[1]) {
            userPoints += 10;

            if (recommendationText == "") {
              recommendationText = user.firstName + '\'s average run length is in your preferred range\'';
            }
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
                if (recommendationText == "") {
                  recommendationText = user.firstName + '\'s average run length is slightly below your preferred average run length range';
                }
              } else {
                lengthDifference = activeUser.preferences.runLength[1] - user.data.averageRunLength;
                userPoints += 10 + 1.5 * user.data.averageRunLength;
                if (recommendationText == "") {
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
            if (recommendationText == "") {
              recommendationText = user.firstName + '\'s average run length is the same as your average run length';
            }
          } else if (user.data.averageRunLength < activeUser.data.averageRunLength) {
            var runningLengthDifference = activeUser.data.averageRunLength - user.data.averageRunLength;
            userPoints += 10 + 2 * runningLengthDifference;
            if (recommendationText == "") {
              recommendationText = user.firstName + '\'s average run length is slightly below your average run length';
            }
          } else {
            var _runningLengthDifference = user.data.averageRunLength - activeUser.data.averageRunLength;
            userPoints += 10 - 2 * _runningLengthDifference;
            if (recommendationText == "") {
              recommendationText = user.firstName + '\'s average run length is slightly above your average run length';
            }
          }
        }

        /*
        ------------------------------------
        Runs Per Week Check
        ------------------------------------
        */

        if ('runsPerWeek' in activeUser.data && 'runsPerWeek' in user.data) {
          if (user.data.runsPerWeek === activeUser.data.runsPerWeek) {
            userPoints += 10;
            if (recommendationText == "") {
              recommendationText = user.firstName + '\'s runs per week is equal to your runs per week';
            }
          } else if (user.data.runsPerWeek < activeUser.data.runsPerWeek) {
            var runsCountDifference = activeUser.data.runsPerWeek - user.data.runsPerWeek;
            userPoints += 10 + 3 * runsCountDifference;
            if (recommendationText == "") {
              recommendationText = user.firstName + '\'s runs per week is slightly below your runs per week';
            }
          } else {
            var _runsCountDifference = user.data.runsPerWeek - activeUser.data.runsPerWeek;
            userPoints += 10 - 3 * _runsCountDifference;
            if (recommendationText == "") {
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
      // console.log("------MATCH REASON------")
      // console.log(user);
      // console.log(recommendationText);

      if (recommendationText == undefined) {
        recommendationText = "";
      }

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
      var _index = Number(limitedUsersIndex[i]);
      // console.log(limitedUsersIndex[i])
      sortedLimitedUsers.push(sortedUsers[_index]);
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
  var email = req.query.email;

  _user2.default.findOne({ "email": email }).then(function (user) {
    res.json(user);
  }).catch(function (error) {
    res.json({ error: error });
  });
};

var getFriendRequestUsers = exports.getFriendRequestUsers = function getFriendRequestUsers(req, res) {
  console.log('made call', req.user);
  var usersRequesting = req.user.requestsReceived;
  var idsArray = Object.keys(usersRequesting);
  _user2.default.find().friendRequests(idsArray).then(function (users) {
    console.log('found friend requests', users);
    res.json(users);
  }).catch(function (error) {
    console.log('error in friend requesting', errors);
    res.json({ error: error });
  });
};

var getUsers = exports.getUsers = function getUsers(req, res) {

  // if (('location' in req.query) && ('email' in req.query)) {
  // let email = req.query.email;
  // let location = req.query.location;
  var email = req.query.email;
  var location = req.query.location;
  var maxDistance = req.query.maxDistance;

  _user2.default.findOne({ 'email': email }).then(function (user) {
    // console.log('USER IN GETUSERS: ', user);
    var preferences = user.preferences;
    // Needs to be meters, convert from preferences.proximity
    // location needs to be an array of floats [<long>, <lat>]
    var query = _user2.default.find();
    query.where('location').near({ center: { type: 'Point', coordinates: location }, maxDistance: maxDistance, spherical: true }).then(function (users) {
      // DO SOMETHING WITH LIST OF NEARBY USERS
      // Users Limited by MaxUsers
      sortUsers(user, users, preferences).then(function (sortedUsers) {
        res.json(sortedUsers);
      }).catch(function (error) {
        res.json(error);
      });
      // res.json(users);
    }).catch(function (error) {
      res.json({ error: error });
    });

    // user.Update({'location': })
  }).catch(function (error) {
    res.json({ error: error });
  });
  // } else {
  //   res.json("user does not exist");
  // }
};

var getProfile = exports.getProfile = function getProfile(req, res) {};

/*eslint-enable*/