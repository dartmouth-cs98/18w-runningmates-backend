'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _stravaV = require('strava-v3');

var _stravaV2 = _interopRequireDefault(_stravaV);

var _userStrava = require('../models/userStrava');

var _userStrava2 = _interopRequireDefault(_userStrava);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getData = function getData(req, res, next) {
  var token = req.body.token;
  var athlete = new _userStrava2.default();

  _stravaV2.default.athlete.get({ id: token }, function (err, payload, limits) {
    if (!err) {
      var firstName = payload.firstname;
      var lastName = payload.lastname;
      var sex = payload.sex;
      var email = payload.email;

      // console.log(payload);
      // athlete.firstName = payload.firstname;
      // athlete.lastName = payload.lastname;
      // athlete.sex = payload.sex;
      athlete.id = payload.id;
      // console.log(athlete);
      //     athlete.save(function (err, athlete) {
      // if (err) return console.error(err);
      // //res.json(athlete);
      // });
    } else {
      console.log(err);
    }
  });

  // Basic athlete statistics
  _stravaV2.default.athletes.stats({ id: token }, function (err, payload, limits) {
    if (!err) {
      // console.log(payload);
      // athlete.recentCount = payload.recent_run_totals.count;
      // console.log(athlete.recentCount);
      // athlete.recentDistance = payload.recent_run_totals.distance;
      // athlete.recentMovingTime = payload.recent_run_totals.moving_time;
      // athlete.totalCount = payload.all_run_totals.count;
      // console.log(athlete.totalCount);
      // athlete.totalDistance = payload.all_run_totals.distance;
      // athlete.totalMovingTime = payload.all_run_totals.moving_time;
      // athlete.totalElapsedTime = payload.all_run_totals.elapsed_time;
      // athlete.totalElevationGain = payload.all_run_totals.elevation_gain;
      // console.log('printing new athlete');
      // console.log(athlete);
      // athlete.save(function (err, athlete) {
      //   if (err) return console.error(err);
      //   // res.json(athlete);
      // });
    } else {
      console.log(err);
    }
  });

  _stravaV2.athletes.listKoms({id: token},function(err,payload,limits) {
    if(!err) {
        console.log(payload);
        // var koms = Object.keys(payload);
        // for (var i = 0; i < aL.length; i++ ){
        //   activities.push(payload[i].id)
        // }
    }
    else {
        console.log(err);
    }
  });


  // console.log("printing new athlete");
  // console.log(athlete);
  //    athlete.save(function (err, athlete) {
  // if (err) return console.error(err);
  // //res.json(athlete);
  //  });


  console.log('here');
  _userStrava2.default.find(function (err, athletes) {
    console.log('here');
    if (err) return console.error(err);
    console.log(athletes);
    return athletes;
  });
};

exports.default = getData;