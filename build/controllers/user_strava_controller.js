'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getData = undefined;

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _stravaV = require('strava-v3');

var _stravaV2 = _interopRequireDefault(_stravaV);

var _userStrava = require('../models/userStrava');

var _userStrava2 = _interopRequireDefault(_userStrava);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
// function saveAthlete(athlete) {
//   console.log('printing new athlete');
//   console.log(athlete);
//   athlete.save((err, athlete) => {
//     if (err) return console.error(err);
//     // res.json(athlete);
//   });
// }

// function getAthletes() {
//   console.log('here');
//   UserStrava.find((err, athletes) => {
//     console.log('here');
//     if (err) return console.error(err);
//     console.log(athletes);
//     return athletes;
//   });
// }

// function getStravaAthlete(token, athlete) {
//   strava.athlete.get({ id: token }, (err, payload, limits) => {
//     if (!err) {
//       const firstName = payload.firstname;
//       const lastName = payload.lastname;
//       const sex = payload.sex;
//       const email = payload.email;
//
//       // console.log(payload);
//       // athlete.firstName = payload.firstname;
//       // athlete.lastName = payload.lastname;
//       // athlete.sex = payload.sex;
//       athlete.id = payload.id;
//       athlete.athlete_type = payload.athlete_type;
//       // res.json({payload});
//       // console.log(athlete);
// //     athlete.save(function (err, athlete) {
// // if (err) return console.error(err);
// // //res.json(athlete);
// // });
//     } else {
//       console.log(err);
//       res.json({ err });
//     }
//   });
//   console.log();
//   return totalActivityCount;
// }

function getStravaStats(token, totalActivityCount, athlete) {
  // Basic athlete statistics
  return new Promise(function (fulfill, reject) {
    // do stuff
    var newActivityTotal = totalActivityCount;
    _stravaV2.default.athletes.stats({ access_token: _config2.default.strava_access_token, id: token }, function (err, payload, limits) {
      if (!err) {
        console.log(payload);
        // athlete.rRecentCount = payload.recent_run_totals.count;
        // console.log(athlete.recentCount);
        athlete.rRecentDistance = payload.recent_run_totals.distance;
        athlete.rRecentMovingTime = payload.recent_run_totals.moving_time;
        athlete.rTotalCount = payload.all_run_totals.count;
        newActivityTotal = newActivityTotal + payload.all_run_totals.count + payload.all_ride_totals.count + payload.all_swim_totals.count;
        // console.log(athlete.totalCount);
        console.log('inside');
        console.log(newActivityTotal);
        athlete.rTotalDistance = payload.all_run_totals.distance;
        athlete.rTotalMovingTime = payload.all_run_totals.moving_time;
        athlete.rTotalElapsedTime = payload.all_run_totals.elapsed_time;
        athlete.rTotalElevationGain = payload.all_run_totals.elevation_gain;
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

// function getStravaKOMS(token, athlete) {
//   strava.athletes.listKoms({ id: token }, (err, payload, limits) => {
//     if (!err) {
//         // console.log(payload);
//         // res.json({payload});
//       const koms = new Array();
//       const results = Object.keys(payload);
//       for (let i = 0; i < results.length; i++) {
//         const kom = {
//           id: payload[i].id,
//           name: payload[i].name,
//           elapsed_time: payload[i].elapsed_time,
//           moving_time: payload[i].moving_time,
//           date: payload[i].start_date,
//           distance: payload[i].distance,
//         };
//         koms.push(kom);
//       }
//       athlete.koms = koms;
//         // console.log('Koms');
//         // console.log(athlete);
//     } else {
//       console.log(err);
//       res.json({ err });
//     }
//   });
// }


function getActivities(token, totalActivityCount, athlete) {
  var pages = totalActivityCount / 200;
  var remainder = pages % 1;
  if (remainder > 0) {
    pages += 1;
  }
  console.log(pages);
  console.log(remainder);
  // take remainder or for pages + 1

  for (var i = 0; i < pages; i += 1) {
    _stravaV2.default.athlete.listActivities({ id: token, page: 1, per_page: 200 }, function (err, payload, limits) {
      if (!err) {
        var activities = [];
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
        athlete.listActivities = activities;
        console.log('activities');
        console.log(athlete.listActivities);
      } else {
        console.log(err);
      }
    });
  }
}

var getData = exports.getData = function getData(req, res, next) {
  var token = req.body.token;
  var athlete = new _userStrava2.default();
  // const strava = require('strava-v3'); // Not necessary since you define it above
  var totalActivityCount = 0;

  getStravaStats(token, totalActivityCount, athlete).then(function (newtotalActivityCount) {
    // this function is executed after function1
    console.log('made it here???');
    getActivities(token, totalActivityCount, athlete);
  }).catch(function (error) {
    res.json({ error: error });
  });
  // let promise = new Promise(function(resolve, reject) {
  //   console.log("in promise");
  //   totalActivityCount = getStravaStats((token, totalActivityCount, athlete) => resolve());
  //   // setTimeout(() => resolve(1), 1000);
  // });


  // promise.then(function(result) {
  //   console.log("in then");
  //   console.log(totalActivityCount);
  //   getActivities(token, totalActivityCount, athlete);
  // });
  // getStravaStats(token, totalActivityCount, athlete)
  //   .then(function (token, totalActivityCount, athlete){
  //     console.log("in then");
  //     getActivities(token, totalActivityCount, athlete);
  //   });
};

// function getSegments(token, athlete) {
//
// }