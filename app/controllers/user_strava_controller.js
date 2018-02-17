import jwt from 'jwt-simple';
import strava from 'strava-v3';
import UserStrava from '../models/userStrava';

import config from '../config';


export const getData = (req, res, next) => {
  const token = req.body.token;
  let athlete = new UserStrava();
  const strava = require('strava-v3');
  let totalActivityCount = 0; 
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

function saveAthlete (athlete){
  console.log("printing new athlete");
  console.log(athlete);
  athlete.save(function (err, athlete) {
    if (err) return console.error(err);
    //res.json(athlete);
  });
}

function getAthletes (){
  console.log('here');
  UserStrava.find((err, athletes) => {
    console.log('here');
    if (err) return console.error(err);
    console.log(athletes);
    return athletes;
  });
}

function getStravaAthlete (token, athlete){
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
      athlete.athlete_type = payload.athlete_type;
      // res.json({payload});
      // console.log(athlete);
//     athlete.save(function (err, athlete) {
// if (err) return console.error(err);
// //res.json(athlete);
// });
    } else {
      console.log(err);
      res.json({err});
    }
  });
  return totalActivityCount; 

}

function getStravaStats (token, totalActivityCount, athlete){
  // Basic athlete statistics
  strava.athletes.stats({ id: token }, (err, payload, limits) => {
    if (!err) {
      console.log(payload);
      //athlete.rRecentCount = payload.recent_run_totals.count;
      // console.log(athlete.recentCount);
      athlete.rRecentDistance = payload.recent_run_totals.distance;
      athlete.rRecentMovingTime = payload.recent_run_totals.moving_time;
      athlete.rTotalCount = payload.all_run_totals.count;
      totalActivityCount = totalActivityCount + payload.all_run_totals.count + payload.all_ride_totals.count + payload.all_swim_totals.count; 
      // console.log(athlete.totalCount);
      console.log("inside");
      console.log(totalActivityCount);
      athlete.rTotalDistance = payload.all_run_totals.distance;
      athlete.rTotalMovingTime = payload.all_run_totals.moving_time;
      athlete.rTotalElapsedTime = payload.all_run_totals.elapsed_time;
      athlete.rTotalElevationGain = payload.all_run_totals.elevation_gain;
    } else {
      console.log(err);
      res.json({err});
    }
    return totalActivityCount;
  });
  
}

function getStravaKOMS(token, athlete) {
  strava.athletes.listKoms({id: token},function(err,payload,limits) {
    if(!err) {
        // console.log(payload);
        // res.json({payload});
        let koms = new Array();
        const results = Object.keys(payload);
        for (let i = 0; i < results.length; i++ ){
          let kom = {
            id: payload[i].id,
            name: payload[i].name,
            elapsed_time: payload[i].elapsed_time,
            moving_time: payload[i].moving_time,
            date: payload[i].start_date, 
            distance: payload[i].distance,
          };
          koms.push(kom);

        }
        athlete.koms = koms; 
        // console.log('Koms');
        // console.log(athlete); 
    }
    else {
        console.log(err);
        res.json({err});
    }
  });
}


function getActivities(token, totalActivityCount, athlete) {
  let pages = (totalActivityCount/200);
  let remainder = pages % 1; 
  if (remainder > 0 ){ pages = pages + 1;}
  console.log(pages);
  console.log(remainder);
  // take remainder or for pages + 1  
  
  for (var i = 0; i < pages; i++){
    strava.athlete.listActivities({id:token, 'page':1, 'per_page':200},function(err,payload,limits) {
      if(!err) {
        var activities = new Array;
        var results = Object.keys(payload);
          //console.log(payload);
          //console.log(aL.length);

          for (var i = 0; i < results.length; i++ ){
            let activity = {
              id: payload[i].id,
              name: payload[i].name
            }; 
            activities.push(activity);

          }
          athlete.listActivities = activities; 
          console.log('activities');
          console.log(athlete.listActivities);
      }
      else {
          console.log(err);
          res.json({err});
      }
    });
  }
}



function getSegments(token, athlete) { 

}

