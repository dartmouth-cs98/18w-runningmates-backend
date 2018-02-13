import jwt from 'jwt-simple';
import strava from 'strava-v3';
import UserStrava from '../models/userStrava';

import config from '../config';


const getData = (req, res, next) => {
  const token = req.body.token;
  const athlete = new UserStrava();

  strava.athlete.get({ id: token }, (err, payload, limits) => {
    if (!err) {
      const firstName = payload.firstname;
      const lastName = payload.lastname;
      const sex = payload.sex;
      const email = payload.email;

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
  strava.athletes.stats({ id: token }, (err, payload, limits) => {
    if (!err) {
      console.log(payload);
      athlete.recentCount = payload.recent_run_totals.count;
      console.log(athlete.recentCount);
      athlete.recentDistance = payload.recent_run_totals.distance;
      athlete.recentMovingTime = payload.recent_run_totals.moving_time;
      athlete.totalCount = payload.all_run_totals.count;
      console.log(athlete.totalCount);
      athlete.totalDistance = payload.all_run_totals.distance;
      athlete.totalMovingTime = payload.all_run_totals.moving_time;
      athlete.totalElapsedTime = payload.all_run_totals.elapsed_time;
      athlete.totalElevationGain = payload.all_run_totals.elevation_gain;
      console.log('printing new athlete');
      console.log(athlete);
      athlete.save((err, athlete) => {
        if (err) return console.error(err);
// res.json(athlete);
      });
    } else {
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
  UserStrava.find((err, athletes) => {
    console.log('here');
    if (err) return console.error(err);
    console.log(athletes);
    return athletes;
  });
};

export default getData;
