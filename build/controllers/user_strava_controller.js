'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getData = exports.getStravaToken = exports.getStravaRedirect = undefined;

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _stravaV = require('strava-v3');

var _stravaV2 = _interopRequireDefault(_stravaV);

var _userStrava = require('../models/userStrava');

var _userStrava2 = _interopRequireDefault(_userStrava);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function saveAthlete(athlete) {
  console.log('\n\n\nprinting new athlete');
  console.log(athlete);

  // athlete.save((err, athlete) => {
  //   if (err) return console.error(err);
  //   // res.json(athlete);
  // });
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

function getStravaAthlete(token, athlete) {
  return new Promise(function (fulfill, reject) {
    _stravaV2.default.athlete.get({ access_token: token }, function (err, payload, limits) {
      if (!err) {
        athlete.id = payload.id;
        athlete.athlete_type = payload.athlete_type;
        athlete.email = payload.email;
        athlete.username = payload.username;
        athlete.sex = payload.sex;
        athlete.firstName = payload.firstname;
        athlete.lastName = payload.lastname;
        console.log(athlete);
        fulfill(athlete);
      } else {
        console.log(err);
        reject(err);
      }
    });
    console.log();
  });
}

function getStravaStats(token, totalActivityCount, athlete) {
  // Basic athlete statistics
  return new Promise(function (fulfill, reject) {
    // do stuff
    var newActivityTotal = totalActivityCount;
    _stravaV2.default.athletes.stats({ access_token: token, id: athlete.id }, function (err, payload, limits) {
      if (!err) {
        console.log(payload);
        console.log("inside");

        newActivityTotal = newActivityTotal + payload.all_run_totals.count + payload.all_ride_totals.count + payload.all_swim_totals.count;
        console.log(newActivityTotal);
        // run totals 
        athlete.rTotalDistance = payload.all_run_totals.distance;
        athlete.rTotalMovingTime = payload.all_run_totals.moving_time;
        athlete.rTotalElapsedTime = payload.all_run_totals.elapsed_time;
        athlete.rTotalElevationGain = payload.all_run_totals.elevation_gain;
        athlete.rTotalCount = payload.all_run_totals.count;
        // run recents 
        athlete.rRecentDistance = payload.recent_run_totals.distance;
        athlete.rRecentMovingTime = payload.recent_run_totals.moving_time;
        athlete.rRecentCount = payload.recent_run_totals.count;

        // bike totals 
        athlete.bTotalDistance = payload.all_ride_totals.distance;
        athlete.bTotalMovingTime = payload.all_ride_totals.moving_time;
        athlete.bTotalElapsedTime = payload.all_ride_totals.elapsed_time;
        athlete.bTotalElevationGain = payload.all_ride_totals.elevation_gain;
        athlete.bTotalCount = payload.all_ride_totals.count;
        // bike recents 
        athlete.bRecentDistance = payload.recent_ride_totals.distance;
        athlete.bRecentMovingTime = payload.recent_ride_totals.moving_time;
        athlete.bRecentCount = payload.recent_ride_totals.count;

        // swim totals 
        athlete.sTotalDistance = payload.all_swim_totals.distance;
        athlete.sTotalMovingTime = payload.all_swim_totals.moving_time;
        athlete.sTotalElapsedTime = payload.all_swim_totals.elapsed_time;
        athlete.sTotalElevationGain = payload.all_swim_totals.elevation_gain;
        athlete.sTotalCount = payload.all_swim_totals.count;
        // swim recents 
        athlete.sRecentDistance = payload.recent_swim_totals.distance;
        athlete.sRecentMovingTime = payload.recent_swim_totals.moving_time;
        athlete.sRecentCount = payload.recent_swim_totals.count;
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
  _stravaV2.default.athletes.listKoms({ id: token }, function (err, payload, limits) {
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
      console.log(err);
      res.json({ err: err });
    }
  });
}

function listActivities(token, page) {
  var activities = [];
  return new Promise(function (fulfill, reject) {
    _stravaV2.default.athlete.listActivities({ access_token: token, page: page, per_page: 200 }, function (err, payload, limits) {
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
    console.log(Array.from(Array(Math.floor(pages)).keys()));
    var promises = Array.from(Array(Math.floor(pages)).keys()).map(function (x) {
      return listActivities(token, x);
    });
    Promise.all(promises).then(function (activityList) {
      var newActivityList = activityList.reduce(function (prev, curr) {
        return prev.concat(curr);
      });
      console.log('\n\n NEW ACTIVITIES LIST', newActivityList);

      var list = athlete.listActivities.concat(newActivityList);
      console.log('activities updated');
      console.log('THIS IS THE NEW LIST: ', list);
      athlete.listActivities = list;
      console.log(athlete);
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
  var totalActivityCount = 0;
  getStravaAthlete(token, athlete).then(function (newAthlete) {
    getStravaStats(token, totalActivityCount, newAthlete).then(function (newtotalActivityCount) {
      // this function is executed after function1
      console.log('made it here???');
      getActivities(token, newtotalActivityCount, newAthlete).then(function (newerAthlete) {
        getSegments(newerAthlete, token).then(function (newestAthlete) {
          saveAthlete(newestAthlete);
        }).catch(function (error) {
          console.log('\n\nFAILED IN GET Segments\n\n');
          console.log(error);
          res.json({ error: error });
        });
      }).catch(function (error) {
        console.log('\n\nFAILED IN GET ACTIVITIES\n\n');
        console.log(error);
        res.json({ error: error });
      });
    }).catch(function (error) {
      res.json({ error: error });
    });
  });
};

function listSegments(token, id) {
  var segments = [];

  return new Promise(function (fulfill, reject) {
    _stravaV2.default.activities.get({ access_token: token, id: id }, function (err, payload, limits) {
      if (!err) {
        for (var segs = 0; segs < payload.segment_efforts.length; segs += 1) {

          var segment = {
            title: payload.segment_efforts[segs].name,
            id: payload.segment_efforts[segs].id,
            elapsedTime: payload.segment_efforts[segs].elapsed_time,
            prRank: payload.segment_efforts[segs].pr_rank,
            distance: payload.segment_efforts[segs].distance,
            komRank: payload.segment_efforts[segs].kom_rank
          };
          console.log(segment);
          segments.push(segment);
        }
        fulfill(segments);
      } else {
        console.log('\n\nDID NOT WORK IN UPDATING LIST OF Segments\n\n');
        console.log(err);
        res.json({ err: err });
        reject(err);
      }
    });
  });

  // return new Promise((fulfill, reject) => {
  //   strava.athlete.listActivities({ access_token: token, page, per_page: 200 }, (err, payload, limits) => {
  //     if (!err) {
  //   // const activities = [];
  //       const results = Object.keys(payload);
  //     // console.log(payload);
  //     // console.log(aL.length);
  //       for (let j = 0; j < results.length; j += 1) {
  //         const activity = {
  //           id: payload[j].id,
  //           name: payload[j].name,
  //         };
  //         activities.push(activity);
  //       }
  //       fulfill(activities);
  //     } else {
  //       console.log('\n\nDID NOT WORK IN UPDATING LIST OF ACTIVITIES\n\n');
  //       console.log(err);
  //       reject(err);
  //     }
  //   });
  // });
}

function getSegments(athlete, token) {
  console.log('\ngetting segments\n');
  //console.log(athlete);
  console.log(athlete.listActivities.length);
  console.log(Array.from(Array(athlete.listActivities.length).keys()));
  console.log(athlete.listActivities[20].id);
  listSegments(token, 173576701);

  return new Promise(function (fulfill, reject) {
    var promises = Array.from(Array(athlete.listActivities.length).keys()).map(function (x) {
      return listSegments(token, athlete.listActivities[x].id);
    });
    Promise.all(promises).then(function (segmentList) {
      var newSegmentList = segmentList.reduce(function (prev, curr) {
        return prev.concat(curr);
      });
      console.log('\n\n NEW Segment LIST', newSegmentList);

      var list = athlete.listSegments.concat(newSegmentList);
      console.log('segments updated');
      console.log('THIS IS THE NEW LIST of segments : ', list);
      athlete.listSegments = list;
      console.log(athlete);
      fulfill(athlete);
    }).catch(function (error) {
      console.log(error);
      reject(error);
    });
  });
}