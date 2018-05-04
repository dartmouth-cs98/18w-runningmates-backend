'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getData = exports.getStravaToken = exports.getStravaRedirect = exports.getAthlete = undefined;

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _stravaV = require('strava-v3');

var _stravaV2 = _interopRequireDefault(_stravaV);

var _userStrava = require('../models/userStrava');

var _userStrava2 = _interopRequireDefault(_userStrava);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function saveAthlete(athlete) {
  console.log('\n\n\nprinting new athlete//// cleaning');
  // console.log(athlete);

  athlete.save(function (err, athlete) {
    if (err) return console.error(err);
    // res.json(athlete );
  });
}

function getAthletes() {
  console.log('here');
  _userStrava2.default.find(function (err, athletes) {
    console.log('here');
    if (err) return console.error(err);
    console.log(athletes);
    return athletes;
  });
}

// not working
var getAthlete = exports.getAthlete = function getAthlete(req, res, next) {
  var id = req.body.id;
  _userStrava2.default.find({ id: id }, function (err, athlete) {
    if (err) {
      res.json(err);
    } else {
      res.json(athlete);
    }
  });
};

function getStravaAthlete(token, athlete, user) {
  return new Promise(function (fulfill, reject) {
    _stravaV2.default.athlete.get({ access_token: token }, function (err, payload, limits) {
      if (!err) {
        var coords = [-147.349442, 64.751114];
        var imgUrl = payload.profile;
        var age = 21;
        var bio = 'I\'m on Strava!';
        var preferences = {
          gender: 'All',
          runLength: [0, 10],
          age: [0, 100],
          proximity: 10000
        };

        var objects = [];
        // console.log(payload);
        athlete.id = payload.id;
        athlete.athlete_type = payload.athlete_type;
        athlete.email = payload.email;
        athlete.username = payload.username;
        athlete.sex = payload.sex;
        athlete.firstName = payload.firstname;
        athlete.lastName = payload.lastname;

        user.firstName = payload.firstname;
        user.lastName = payload.lastname;
        user.gender = payload.sex;
        user.email = payload.email;
        // user.thirdPartyIds.push(payload.id);
        user.preferences = preferences;
        user.bio = bio;
        user.age = age;
        user.imageURL = imgUrl;
        user.location = coords;

        if (!user.thirdPartyIds) {
          user.thirdPartyIds = {
            strava: payload.id
          };
        } else {
          user.thirdPartyIds["strava"] = payload.id;
        }
        // user.thirdPartyIds["strava"] = payload.id;
        // console.log("XXXXXXXXX");
        // console.log(user);
        // console.log(athlete);
        objects[0] = user;
        objects[1] = athlete;
        fulfill(objects);
      } else {
        console.log(err);
        reject(err);
      }
    });
  });
}

function getStravaStats(token, totalActivityCount, objects) {
  // Basic athlete statistics
  return new Promise(function (fulfill, reject) {
    // do stuff
    var newActivityTotal = totalActivityCount;
    _stravaV2.default.athletes.stats({ access_token: token, id: objects[1].id }, function (err, payload, limits) {
      if (!err) {
        // console.log(payload);
        console.log('inside');

        newActivityTotal = newActivityTotal + payload.all_run_totals.count + payload.all_ride_totals.count + payload.all_swim_totals.count;
        console.log(newActivityTotal);
        // run totals
        objects[1].rTotalDistance = payload.all_run_totals.distance;
        objects[1].rTotalMovingTime = payload.all_run_totals.moving_time;
        objects[1].rTotalElapsedTime = payload.all_run_totals.elapsed_time;
        objects[1].rTotalElevationGain = payload.all_run_totals.elevation_gain;
        objects[1].rTotalCount = payload.all_run_totals.count;
        // run recents
        objects[1].rRecentDistance = payload.recent_run_totals.distance;
        objects[1].rRecentMovingTime = payload.recent_run_totals.moving_time;
        objects[1].rRecentCount = payload.recent_run_totals.count;

        // bike totals
        objects[1].bTotalDistance = payload.all_ride_totals.distance;
        objects[1].bTotalMovingTime = payload.all_ride_totals.moving_time;
        objects[1].bTotalElapsedTime = payload.all_ride_totals.elapsed_time;
        objects[1].bTotalElevationGain = payload.all_ride_totals.elevation_gain;
        objects[1].bTotalCount = payload.all_ride_totals.count;
        // bike recents
        objects[1].bRecentDistance = payload.recent_ride_totals.distance;
        objects[1].bRecentMovingTime = payload.recent_ride_totals.moving_time;
        objects[1].bRecentCount = payload.recent_ride_totals.count;

        // swim totals
        objects[1].sTotalDistance = payload.all_swim_totals.distance;
        objects[1].sTotalMovingTime = payload.all_swim_totals.moving_time;
        objects[1].sTotalElapsedTime = payload.all_swim_totals.elapsed_time;
        objects[1].sTotalElevationGain = payload.all_swim_totals.elevation_gain;
        objects[1].sTotalCount = payload.all_swim_totals.count;
        // swim recents
        objects[1].sRecentDistance = payload.recent_swim_totals.distance;
        objects[1].sRecentMovingTime = payload.recent_swim_totals.moving_time;
        objects[1].sRecentCount = payload.recent_swim_totals.count;

        // user data update
        objects[0].data.totalMilesRun = payload.all_run_totals.distance * 0.000621371;
        objects[0].data.totalElevationClimbed = payload.all_run_totals.elevation_gain;
        // runs per week and average run length
      } else {
        console.log('we getting errors mate');
        console.log(err);
        reject(err);
      }
      console.log('fulfilling');
      fulfill(newActivityTotal);
    });
  });
}

// * need to make this a promise as well for people with a lot of KOMs *
function getStravaKOMS(token, athlete) {
  _stravaV2.default.athletes.listKoms({ id: athlete.id }, function (err, payload, limits) {
    if (!err) {
      // console.log(payload);
      // res.json({payload});
      var koms = new Array();
      var results = Object.keys(payload);
      for (var i = 0; i < results.length; i++) {
        var kom = {
          id: payload[i].id,
          name: payload[i].name,
          elapsed_time: payload[i].elapsed_time,
          moving_time: payload[i].moving_time,
          date: payload[i].start_date,
          distance: payload[i].distance
        };
        koms.push(kom);
      }
      athlete.koms = koms;
      // console.log('Koms');
      // console.log(athlete);
    } else {
      console.log('KOMS error');
      console.log(err);
      res.json({ err: err });
    }
  });
}

function listActivities(token, page) {
  var activities = [];
  console.log('Page: ' + page);
  return new Promise(function (fulfill, reject) {
    _stravaV2.default.athlete.listActivities({ access_token: token, page: page + 1, per_page: 200 }, function (err, payload, limits) {
      if (!err) {
        // const activities = [];
        var results = Object.keys(payload);
        // console.log(payload);
        // console.log(aL.length);
        for (var j = 0; j < results.length; j += 1) {
          var activity = {
            id: payload[j].id,
            name: payload[j].name
          };
          activities.push(activity);
        }
        fulfill(activities);
      } else {
        console.log('\n\nDID NOT WORK IN UPDATING LIST OF ACTIVITIES\n\n');
        console.log(err);
        reject(err);
      }
    });
  });
}

// function updateAthleteActivities(token, pages) {
//   const promises = Array(Math.floor(pages)).map((x) => { return listActivities(token, x); });
//   return promises;
// }

function getActivities(token, totalActivityCount, athlete) {
  var pages = totalActivityCount / 200 + 1;

  return new Promise(function (fulfill, reject) {
    console.log('Get activities');
    // console.log(Array.from(Array(Math.floor(pages)).keys()));
    var promises = Array.from(Array(Math.floor(pages)).keys()).map(function (x) {
      return listActivities(token, x);
    });
    Promise.all(promises).then(function (activityList) {
      var newActivityList = activityList.reduce(function (prev, curr) {
        return prev.concat(curr);
      });
      // console.log('\n\n NEW ACTIVITIES LIST', newActivityList);

      var list = athlete.listActivities.concat(newActivityList);
      // console.log('activities updated');
      // console.log('THIS IS THE NEW LIST: ', list);
      athlete.listActivities = list;
      // console.log(athlete);
      fulfill(athlete);
    }).catch(function (error) {
      console.log(error);
      reject(error);
    });
  });

  // take remainder or for pages + 1
}

var getStravaRedirect = exports.getStravaRedirect = function getStravaRedirect(req, res) {
  // const strava = require('strava-v3'); // Not necessary since you define it above
  var redirectURL = _stravaV2.default.oauth.getRequestAccessURL({ scope: 'view_private' });
  console.log(redirectURL);
  res.send({ redirectURL: redirectURL });
};

var getStravaToken = exports.getStravaToken = function getStravaToken(req, res) {
  var code = req.body.token;
  console.log(code);

  _stravaV2.default.oauth.getToken(code, function (err, payload, limits) {
    if (!err) {
      console.log(payload);
      console.log('made it');
      res.send({ access_token: payload });
    } else {
      console.log(err);
      res.send({ err: err });
    }
  });
};

var getData = exports.getData = function getData(req, res, next) {
  var token = req.body.token;
  var athlete = new _userStrava2.default();
  var user = new _user2.default();
  var totalActivityCount = 0;
  console.log(token);
  getStravaAthlete(token, athlete, user).then(function (newObjects) {
    // res.json(newObjects[0]);
    getStravaKOMS(token, newObjects[1]);
    getStravaStats(token, totalActivityCount, newObjects).then(function (newtotalActivityCount) {
      // this function is executed after function1
      // respond with the user object
      res.json(newObjects[0]);
      // save the user object to the database
      newObjects[0].save(function (err, newUser) {
        if (err) return console.error("save error: ", err);
        // res.json(athlete);
      });
      getActivities(token, newtotalActivityCount, newObjects[1]).then(function (newerAthlete) {
        getSegments(newerAthlete, token).then(function (newSegList) {
          cleanSegments(newerAthlete, newSegList).then(function (newestAthlete) {
            saveAthlete(newestAthlete);
          });
        }).catch(function (error) {
          console.log('\n\nFAILED IN clean segments \n\n');
          console.log(error);
          res.json({ error: error });
        });
      }).catch(function (error) {
        console.log('\n\nFAILED IN get segments \n\n');
        console.log(error);
        res.json({ error: error });
      });
    }).catch(function (error) {
      console.log('\n\nFAILED IN get Activities  \n\n');
      console.log(error);
      res.json({ error: error });
    });
  });
};

function cleanSegments(athlete, newSegList) {
  var listofIds = [];
  var listToAdd = [];
  return new Promise(function (fulfill, reject) {
    newSegList.forEach(function (value, index) {
      // let id = athlete.listSegments[index].id;
      // athlete.listSegments.forEach( function (value, index){
      //   if (id === athlete)
      // });
      console.log(listofIds.indexOf(newSegList[index].id));
      if (listofIds.indexOf(newSegList[index].id) != -1) {
        var objIndex = listToAdd.findIndex(function (obj) {
          return obj.id == newSegList[index].id;
        });
        //console.log('Before update: ', listToAdd[objIndex]);
        listToAdd[objIndex].count += 1;
        if (newSegList[index].elapsedTime < listToAdd[objIndex].elapsedTime) {
          listToAdd[objIndex].elapsedTime = newSegList[index].elapsedTime;
          listToAdd[objIndex].komRank = newSegList[index].komRank;
        }
        //console.log('After update: ', listToAdd[objIndex]);
      } else {
        listofIds.push(newSegList[index].id);
        listToAdd.push(value);
        //console.log('in the else');
        // console.log(listofIds);
      }
      // console.log(newSegList[index].id);
      // console.log(index);
    });

    // console.log(listofIds);

    athlete.listSegments = listToAdd;
    //console.log(athlete.listSegments);
    fufill(athlete);
  });
}

function listSegments(token, id) {
  var segments = [];

  return new Promise(function (fulfill, reject) {
    _stravaV2.default.activities.get({ access_token: token, id: id }, function (err, payload, limits) {
      if (!err) {
        if (payload.segment_efforts.length) {
          for (var segs = 0; segs < payload.segment_efforts.length; segs += 1) {
            var segment = {
              title: payload.segment_efforts[segs].name,
              id: payload.segment_efforts[segs].segment.id,
              elapsedTime: payload.segment_efforts[segs].elapsed_time,
              prRank: payload.segment_efforts[segs].pr_rank,
              distance: payload.segment_efforts[segs].segment.distance,
              komRank: payload.segment_efforts[segs].kom_rank,
              count: 1
            };
            // console.log(segment);
            segments.push(segment);
          }
          fulfill(segments);
        } else {
          fulfill(segments);
        }
      } else {
        console.log('\n\nDID NOT WORK IN UPDATING LIST OF Segments\n\n');
        console.log(err);
        res.json({ err: err });
        reject(err);
      }
    });
  });
}

function getSegments(athlete, token) {
  console.log('\ngetting segments\n');
  // console.log(athlete);
  //console.log(athlete.listActivities.length);
  //console.log(Array.from(Array(athlete.listActivities.length).keys()));
  // console.log(athlete.listActivities[20].id);
  // listSegments(token, 173576701);

  return new Promise(function (fulfill, reject) {
    var promises = Array.from(Array(athlete.listActivities.length).keys()).map(function (x) {
      return listSegments(token, athlete.listActivities[x].id);
    });
    Promise.all(promises).then(function (segmentList) {
      var newSegmentList = segmentList.reduce(function (prev, curr) {
        return prev.concat(curr);
      });
      // console.log('\n\n NEW Segment LIST', newSegmentList);

      // ****** const list = athlete.listSegments.concat(newSegmentList);

      // console.log('segments updated');
      // console.log('THIS IS THE NEW LIST of segments : ', list);

      // ***** athlete.listSegments = list;
      // console.log(athlete);
      fulfill(newSegmentList);
    }).catch(function (error) {
      console.log('the error is in get segments');
      console.log(error);
      reject(error);
    });
  });
}