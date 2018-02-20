import jwt from 'jwt-simple';
import strava from 'strava-v3';
import UserStrava from '../models/userStrava';

import config from '../config';

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

function getStravaAthlete(token, athlete) {
  return new Promise((fulfill, reject) => {
    strava.athlete.get({ access_token: token }, (err, payload, limits) => {
      if (!err) {
        // console.log(payload);
        // athlete.firstName = payload.firstname;
        // athlete.lastName = payload.lastname;
        // athlete.sex = payload.sex;
        athlete.id = payload.id;
        athlete.athlete_type = payload.athlete_type;
        console.log(athlete);
        fulfill(athlete);
        // res.json({payload});
        // console.log(athlete);
  //     athlete.save(function (err, athlete) {
  // if (err) return console.error(err);
  // //res.json(athlete);
  // });
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
  return new Promise((fulfill, reject) => {
     // do stuff
    let newActivityTotal = totalActivityCount;
    strava.athletes.stats({ access_token: token, id: athlete.id }, (err, payload, limits) => {
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

function listActivities(token, page) {
  const activities = [];
  return new Promise((fulfill, reject) => {
    strava.athlete.listActivities({ access_token: token, page, per_page: 200 }, (err, payload, limits) => {
      if (!err) {
    // const activities = [];
        const results = Object.keys(payload);
      // console.log(payload);
      // console.log(aL.length);
        for (let j = 0; j < results.length; j += 1) {
          const activity = {
            id: payload[j].id,
            name: payload[j].name,
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
  const pages = (totalActivityCount / 200) + 1;

  return new Promise((fulfill, reject) => {
    console.log(Array.from(Array(Math.floor(pages)).keys()));
    const promises = Array.from(Array(Math.floor(pages)).keys()).map((x) => { return listActivities(token, x); });
    Promise.all(promises)
    .then((activityList) => {
      const newActivityList = activityList.reduce((prev, curr) => {
        return prev.concat(curr);
      });
      console.log('\n\n NEW ACTIVITIES LIST', newActivityList);

      const list = athlete.listActivities.concat(newActivityList);
      console.log('activities updated');
      console.log('THIS IS THE NEW LIST: ', list);
      athlete.listActivities = list;
      console.log(athlete);
      fulfill(athlete);
    })
    .catch((error) => {
      console.log(error);
      reject(error);
    });
  });


  // take remainder or for pages + 1
}

export const getStravaRedirect = (req, res) => {
  // const strava = require('strava-v3'); // Not necessary since you define it above
  const redirectURL = strava.oauth.getRequestAccessURL({ scope: 'view_private' });
  console.log(redirectURL);
  res.send({ redirectURL });
};

export const getStravaToken = (req, res) => {
  const code = req.body.token;
  console.log(code);

  strava.oauth.getToken(code, (err, payload, limits) => {
    if (!err) {
      console.log(payload);
      console.log('made it');
      res.send({ access_token: payload });
    } else {
      console.log(err);
      res.send({ err });
    }
  });
};

export const getData = (req, res, next) => {
  const token = req.body.token;
  const athlete = new UserStrava();
  const totalActivityCount = 0;
  getStravaAthlete(token, athlete)
  .then((newAthlete) => {
    getStravaStats(token, totalActivityCount, newAthlete)
    .then((newtotalActivityCount) => {
              // this function is executed after function1
      console.log('made it here???');
      getActivities(token, newtotalActivityCount, newAthlete)
      .then((newerAthlete) => {
        getSegments(newerAthlete);
      })
      .catch((error) => {
        console.log('\n\nFAILED IN GET ACTIVITIES\n\n');
        res.json({ error });
      })
      ;
    })
    .catch((error) => {
      res.json({ error });
    });
  })
  ;


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

function getSegments(athlete) {
  console.log('\ngetting segments\n');
  console.log(athlete);
}
