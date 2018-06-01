import jwt from 'jwt-simple';
import strava from 'strava-v3';
import UserStrava from '../models/userStrava';
import User from '../models/user';

import config from '../config';


function saveAthlete(athlete, res) {
  console.log('\n\n\nprinting new athlete//// cleaning');
  // console.log(athlete);


  athlete.save((err, athlete) => {
    if (err) {
      console.log(error);
      return err;
    } else { 
      console.log(athlete); 
    }
    // res.json(athlete );
  });

  // athlete.save()
  // .then((result) => {
  //   // res.send({ user: result });
  // })
  // .catch((error) => {
  //   console.log(error);
  //   // res.status(420).send('Error saving user');

  // });
}

function getAthletes() {
  console.log('here');
  UserStrava.find((err, athletes) => {
    console.log('here');
    if (err) return console.error(err);
    console.log(athletes);
    return athletes;
  });
}

// not working
export const getAthlete = (req, res, next) => {
  const id = req.body.id;
  UserStrava.find({ id }, (err, athlete) => {
    if (err) {
      res.json(err);
    } else {
      res.json(athlete);
    }
  });
};

function getStravaAthlete(token, athlete, user) {
  return new Promise((fulfill, reject) => {
    strava.athlete.get({ access_token: token }, (err, payload, limits) => {
      if (!err) {
        const imgUrl = payload.profile; 
        var userImages = []; 
        userImages.push(imgUrl);
        console.log("USERIMAGES: ", userImages); 
        const preferences = {
          gender: 'All',
          runLength: [0, 10],
          age: [0, 100],
          proximity: 10000,
        };

        const objects = [];
        // console.log(payload);
        athlete.id = payload.id;
        athlete.athlete_type = payload.athlete_type;
        athlete.email = payload.email;
        athlete.username = payload.username;
        athlete.sex = payload.sex;
        athlete.firstName = payload.firstname;
        athlete.lastName = payload.lastname;
        var createDate = new Date (payload.created_at);
        athlete.createDate = createDate;
        var currentDate = new Date (); 
        var timeDiff = Math.abs(currentDate.getTime() - createDate.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        athlete.diffDays = diffDays;  

        user.firstName = payload.firstname;
        user.lastName = payload.lastname;
        user.gender = payload.sex;
        user.email = payload.email;
        // user.email = "briansfakeemail@gmail.com"; 
        // user.thirdPartyIds.push(payload.id);
        user.preferences = preferences;

        user.images = userImages;

        console.log("USER object images", user.images); 

        if (!user.thirdPartyIds) {
          user.thirdPartyIds = {
            strava: payload.id
          };
        }
        else {
          user.thirdPartyIds["strava"] = payload.id;
        }
        // user.thirdPartyIds["strava"] = payload.id;
        console.log("XXXXXXXXX");
        console.log(user);
        console.log(athlete);
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
  return new Promise((fulfill, reject) => {
     // do stuff
    let newActivityTotal = totalActivityCount;
    strava.athletes.stats({ access_token: token, id: objects[1].id }, (err, payload, limits) => {
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


        console.log("Weeks on the service: "); 
        console.log(objects[1].diffDays/7); 

        console.log("total runs: ");
        console.log(payload.all_run_totals.count); 
        console.log("total miles: ");
        console.log(payload.all_run_totals.distance * 0.000621371); 
        // runs per week
        let totalRunsPerWeek = payload.all_run_totals.count/ objects[1].diffDays / 7;
        let recentRunsPerWeek = payload.recent_run_totals.count/ 4; 
        if (totalRunsPerWeek > recentRunsPerWeek ){
          objects[0].data.runsPerWeek = totalRunsPerWeek;
        } else {
          objects[0].data.runsPerWeek = recentRunsPerWeek;
        }
        console.log("runs Per week: ");
        console.log(objects[0].data.runsPerWeek);    

        // miles per week 
        let totalMilesPerWeek = objects[0].data.totalMilesRun / objects[1].diffDays / 7;
        let recentMilesPerWeek = payload.recent_run_totals.distance * 0.000621371/4; 
        if (totalMilesPerWeek > recentMilesPerWeek){ 
          objects[0].data.milesPerWeek  = totalMilesPerWeek; 
        } else { 
          objects[0].data.milesPerWeek  = recentMilesPerWeek;
        }
        console.log("miles Per week: ");
        console.log(objects[0].data.milesPerWeek);  
        // Average run length 
        let totalAvgRun = 0;  
        if (payload.all_run_totals.count == "Nan"){
          totalAvgRun = 0; 
        } else { 
          totalAvgRun = objects[0].data.totalMilesRun /payload.all_run_totals.count;
        }
 
        objects[0].data.averageRunLength = totalAvgRun; 
        console.log("average run length: ");
        console.log(objects[0].data.averageRunLength);  
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
  strava.athletes.listKoms({ id: athlete.id }, (err, payload, limits) => {
    if (!err) {
        // console.log(payload);
        // res.json({payload});
      const koms = new Array();
      const results = Object.keys(payload);
      console.log("kom bug");
      console.log(results); 
      console.log("results length");
      console.log(results.length)
      for (let i = 0; i < results.length; i++) {
        const kom = {
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
    } else {
      console.log('KOMS error');
      console.log(err);
      res.json({ err });
    }
  });
}

function listActivities(token, page) {
  const activities = [];
  console.log(`Page: ${page}`);
  return new Promise((fulfill, reject) => {
    strava.athlete.listActivities({ access_token: token, page: (page + 1), per_page: 200 }, (err, payload, limits) => {
      if (!err) {
    // const activities = [];
        const results = Object.keys(payload);
      // console.log(payload);
      // console.log(aL.length);
        for (let j = 0; j < results.length; j += 1) {
          // keeping only running activities 
          const activity = {
            id: payload[j].id,
            name: payload[j].name,
          };
          if (payload[j].type == "Run"){
            activities.push(activity);
          }
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
    console.log('Get activities');
    // console.log(Array.from(Array(Math.floor(pages)).keys()));
    const promises = Array.from(Array(Math.floor(pages)).keys()).map((x) => { return listActivities(token, x); });
    Promise.all(promises)
    .then((activityList) => {
      const newActivityList = activityList.reduce((prev, curr) => {
        return prev.concat(curr);
      });
      // console.log('\n\n NEW ACTIVITIES LIST', newActivityList);

      const list = athlete.listActivities.concat(newActivityList);
      // console.log('activities updated');
      // console.log('THIS IS THE NEW LIST: ', list);
      athlete.listActivities = list;
      // console.log(athlete);
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

export const getMatchingSegments = (req, res, next) => {
  console.log(req.body);
  const rmId = req.body.id;
  const targetRmId = req.body.targetId; 
  let targetSegments = {}; 
  let userSegments = {};
  let matchingSegments = [];

  // target user 
  User.findOne({ _id: targetRmId })
  .then((targetUser) => {
    if (targetUser) {
      if (targetUser.thirdPartyIds){
        if("strava" in targetUser.thirdPartyIds){
          const targetStravaId = targetUser.thirdPartyIds.strava; 
          UserStrava.findOne({ id: targetStravaId })
          .then ((targetStravaUser)=>{
            targetSegments = targetStravaUser.segments;
            console.log("targetSegments", targetSegments);
            // user 
            User.findOne({ _id: rmId })
            .then((user) => {
              if (user) {
                if (user.thirdPartyIds){
                  if("strava" in user.thirdPartyIds){
                    const userStravaId = user.thirdPartyIds.strava; 
                    UserStrava.findOne({ id: userStravaId })
                    .then ((userStravaUser)=>{
                      userSegments = userStravaUser.segments;
                      console.log("userSegments", userSegments); 
                      if(targetSegments){ 
                        if (userSegments){
                          const keys = Object.keys(userSegments);
                          console.log(keys);  
                          for (var key in keys){ 
                            console.log(targetSegments.hasOwnProperty(keys[key]));
                            if (targetSegments.hasOwnProperty(keys[key])){
                              const segment = {
                                title: targetSegments[keys[key]].title,
                                id: keys[key],
                                userElapsedTime: userSegments[keys[key]].elapsedTime,
                                userTime: userSegments[keys[key]].timeString,
                                targetTime: targetSegments[keys[key]].timeString,
                                targetElapsedTime: targetSegments[keys[key]].elapsedTime,
                                targetPrRank: targetSegments[keys[key]].prRank,
                                userPrRank: userSegments[keys[key]].prRank,
                                distance: targetSegments[keys[key]].distance,
                                targetCount: targetSegments[keys[key]].count
                              };
                              matchingSegments.push(segment);
                              console.log("segment matches", segment); 
                            }
                          }
                          if (matchingSegments.length == 0){
                            const keys = Object.keys(targetSegments);  
                            for (var key in keys){
                              if (matchingSegments.length < 5){
                                const segment = {
                                title: targetSegments[keys[key]].title,
                                id: keys[key],
                                userElapsedTime: null,
                                userTime: null,
                                targetTime: targetSegments[keys[key]].timeString,
                                targetElapsedTime: targetSegments[keys[key]].elapsedTime,
                                targetPrRank: targetSegments[keys[key]].prRank,
                                userPrRank: null,
                                distance: targetSegments[keys[key]].distance,
                                targetCount: targetSegments[keys[key]].count
                              };
                              matchingSegments.push(segment);
                              } else {
                                let x = 0;  
                                while(x < 5){
                                  if (matchingSegments[x].targetCount < targetSegments[keys[key]].count){
                                    matchingSegments[x] = {
                                      title: targetSegments[keys[key]].title,
                                      id: keys[key],
                                      userElapsedTime: null,
                                      userTime: null,
                                      targetTime: targetSegments[keys[key]].timeString,
                                      targetElapsedTime: targetSegments[keys[key]].elapsedTime,
                                      targetPrRank: targetSegments[keys[key]].prRank,
                                      userPrRank: null,
                                      distance: targetSegments[keys[key]].distance,
                                      targetCount: targetSegments[keys[key]].count
                                    };
                                    x = 5; 
                                  } else {
                                    x = x + 1; 
                                  }
                                }
                              }
                            }

                          }
                          console.log("matching segments list: ", matchingSegments);
                          res.json(matchingSegments);
                        } else { 
                          // target is a strava users 
                          console.log("target is strava user is not: ", targetSegments);
                          const keys = Object.keys(targetSegments);  
                          for (var key in keys){
                            if (matchingSegments.length < 5){
                              const segment = {
                              title: targetSegments[keys[key]].title,
                              id: keys[key],
                              userElapsedTime: null,
                              userTime: null,
                              targetTime: targetSegments[keys[key]].timeString,
                              targetElapsedTime: targetSegments[keys[key]].elapsedTime,
                              targetPrRank: targetSegments[keys[key]].prRank,
                              userPrRank: null,
                              distance: targetSegments[keys[key]].distance,
                              targetCount: targetSegments[keys[key]].count
                            };
                            matchingSegments.push(segment);
                            } else {
                              let x = 0;  
                              while(x < 5){
                                if (matchingSegments[x].targetCount < targetSegments[keys[key]].count){
                                  matchingSegments[x] = {
                                    title: targetSegments[keys[key]].title,
                                    id: keys[key],
                                    userElapsedTime: null,
                                    userTime: null,
                                    targetTime: targetSegments[keys[key]].timeString,
                                    targetElapsedTime: targetSegments[keys[key]].elapsedTime,
                                    targetPrRank: targetSegments[keys[key]].prRank,
                                    userPrRank: null,
                                    distance: targetSegments[keys[key]].distance,
                                    targetCount: targetSegments[keys[key]].count
                                  };
                                  x = 5; 
                                } else {
                                  x = x + 1; 
                                }
                              }
                            }
                          }

                        }
                      } else { 
                        console.log("neither are target users"); 
                        res.json(matchingSegments);
                      }
                    })
                  } else { 
                    console.log("Strava is not a third party");
                    res.json(matchingSegments);
                  }
                } else { 
                  console.log("No third parties"); 
                  console.log("target is strava user is not: ", targetSegments);
                  const keys = Object.keys(targetSegments);  
                  for (var key in keys){
                    if (matchingSegments.length < 5){
                      const segment = {
                      title: targetSegments[keys[key]].title,
                      id: keys[key],
                      userElapsedTime: null,
                      targetElapsedTime: targetSegments[keys[key]].elapsedTime,
                      targetPrRank: targetSegments[keys[key]].prRank,
                      userPrRank: null,
                      distance: targetSegments[keys[key]].distance,
                      targetCount: targetSegments[keys[key]].count
                    };
                    matchingSegments.push(segment);
                    } else {
                      let x = 0;  
                      while(x < 5){
                        if (matchingSegments[x].targetCount < targetSegments[keys[key]].count){
                          matchingSegments[x] = {
                            title: targetSegments[keys[key]].title,
                            id: keys[key],
                            userElapsedTime: null,
                            targetElapsedTime: targetSegments[keys[key]].elapsedTime,
                            targetPrRank: targetSegments[keys[key]].prRank,
                            userPrRank: null,
                            distance: targetSegments[keys[key]].distance,
                            targetCount: targetSegments[keys[key]].count
                          };
                          x = 5; 
                        } else {
                          x = x + 1; 
                        }
                      }
                    }
                  }
                }
              } else { 
                console.log('user does not exist');
                console.log("target is strava user is not: ", targetSegments);
                const keys = Object.keys(targetSegments);  
                for (var key in keys){
                  if (matchingSegments.length < 5){
                    const segment = {
                    title: targetSegments[keys[key]].title,
                    id: keys[key],
                    userElapsedTime: null,
                    targetElapsedTime: targetSegments[keys[key]].elapsedTime,
                    targetPrRank: targetSegments[keys[key]].prRank,
                    userPrRank: null,
                    distance: targetSegments[keys[key]].distance,
                    targetCount: targetSegments[keys[key]].count
                  };
                  matchingSegments.push(segment);
                  } else {
                    let x = 0;  
                    while(x < 5){
                      if (matchingSegments[x].targetCount < targetSegments[keys[key]].count){
                        matchingSegments[x] = {
                          title: targetSegments[keys[key]].title,
                          id: keys[key],
                          userElapsedTime: null,
                          targetElapsedTime: targetSegments[keys[key]].elapsedTime,
                          targetPrRank: targetSegments[keys[key]].prRank,
                          userPrRank: null,
                          distance: targetSegments[keys[key]].distance,
                          targetCount: targetSegments[keys[key]].count
                        };
                        x = 5; 
                      } else {
                        x = x + 1; 
                      }
                    }
                  }
                }
              }
            });
          })
        } else { 
          console.log("Strava is not a third party");
          res.json(matchingSegments);
        }
      } else { 
        console.log("No third parties"); 
        res.json(matchingSegments);
      }
    } else { 
      console.log('user does not exist');
      res.json(matchingSegments);
    }
  });


  // user 
  // User.findOne({ _id: rmId })
  // .then((user) => {
  //   if (user) {
  //     if (user.thirdPartyIds){
  //       if("strava" in user.thirdPartyIds){
  //         const userStravaId = user.thirdPartyIds.strava; 
  //         UserStrava.findOne({ id: userStravaId })
  //         .then ((userStravaUser)=>{
  //           userSegments = userStravaUser.segments;
  //         })
  //       } else { 
  //         console.log("Strava is not a third party");
  //       }
  //     } else { 
  //       console.log("No third parties"); 
  //     }
  //   } else { 
  //     console.log('user does not exist');
  //   }
  // });

  // if(targetSegments){ 
  //   if (userSegments){
  //     const keys = Object.keys(userSegments); 
  //     for (key in keys){ 
  //       if (key in targetSegments){
  //         const segment = {
  //           title: targetSegments[key].title,
  //           id: key,
  //           userElapsedTime: payload.segment_efforts[segs].elapsed_time,
  //           targetElapsedTime: targetSegments[key].elapsedTime,
  //           targetPrRank: targetSegments[key].prRank,
  //           userPrRank: userSegments[key].prRank,
  //           distance: targetSegments[key]
  //         };
  //         matchingSegments.push(segment);
  //         console.log("segment matches", segment); 
  //       }
  //     }
  //     console.log("matching segments list: ", matchingSegments);
  //     res.json(matchingSegments)
  //   } else { 
  //     // target is a strava users 
  //     console.log("target is strava user is not: ", targetSegments);

  //   }
  // } else { 
  //   console.log("neither are target users"); 
  // }

};

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

export const getData = (req, res, next) => {
  const token = req.body.token;
  const athlete = new UserStrava();
  const user = new User();
  const totalActivityCount = 0;
  console.log("got a request");
  console.log(token);
  getStravaAthlete(token, athlete, user)
  .then((newObjects) => {
    // res.json(newObjects[0]);
    // getStravaKOMS(token, newObjects[1]);
    getStravaStats(token, totalActivityCount, newObjects)
    .then((newtotalActivityCount) => {

      newObjects[0].save()
        .then((result) => {
          res.send({ token: tokenForUser(result), user: result });
        })
        .catch((error) => {
          console.log(error);
          res.status(420).send('Error saving user');

        });
      getActivities(token, newtotalActivityCount, newObjects[1])
      .then((newerAthlete) => {
        getSegments(newerAthlete, token)
        .then((newestAthlete) => {
          saveAthlete(newestAthlete, res);
        });
      })
      .catch((error) => {
        console.log('\n\nFAILED IN get segments \n\n');
        console.log(error);
        res.json({ error });
      })
      ;
    })
    .catch((error) => {
      console.log('\n\nFAILED IN get Activities  \n\n');
      console.log(error);
      res.json({ error });
    });
  })
  ;
};




function cleanSegments(athlete, newSegList) {
  const listofIds = [];
  const listToAdd = [];
  console.log("in clean segments"); 
  return new Promise((fulfill, reject) => {
    newSegList.forEach((value, index) => {
      // let id = athlete.listSegments[index].id;
      // athlete.listSegments.forEach( function (value, index){
      //   if (id === athlete)
      // });
      console.log(listofIds.indexOf(newSegList[index].id));
      if (listofIds.indexOf(newSegList[index].id) != -1) {
        const objIndex = listToAdd.findIndex(((obj) => { return obj.id == newSegList[index].id; }));
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

function listSegments(token, id, athlete) {
  athlete.segments = athlete.segments || {};
  return new Promise((fulfill, reject) => {
    strava.activities.get({ access_token: token, id }, (err, payload, limits) => {
      if (!err) {
        if (payload.segment_efforts.length) {
          for (let segs = 0; segs < payload.segment_efforts.length; segs += 1) {
            const segmentId = payload.segment_efforts[segs].segment.id; 
            const minutes = (payload.segment_efforts[segs].elapsed_time/60|0).toString();
            const seconds = (payload.segment_efforts[segs].elapsed_time%60).toString();
            const timeString = minutes + ':' + seconds; 
            if (!(segmentId in athlete.segments)) {
              const distance = payload.segment_efforts[segs].segment.distance * 0.000621371;
              const segment = {
              title: payload.segment_efforts[segs].name,
              id: segmentId,
              elapsedTime: payload.segment_efforts[segs].elapsed_time,
              timeString: timeString, 
              prRank: payload.segment_efforts[segs].pr_rank,
              distance: distance,
              komRank: payload.segment_efforts[segs].kom_rank,
              count: 1,
            };
              athlete.segments[segmentId] = segment;
            } else {
              if (athlete.segments[segmentId].elapsedTime > payload.segment_efforts[segs].elapsed_time){
                athlete.segments[segmentId].elapsedTime = payload.segment_efforts[segs].elapsed_time;
              }
              athlete.segments[segmentId].count = athlete.segments[segmentId].count + 1; 
            }
            // console.log(segment);
          }
          fulfill(athlete.segments);
        } else {
          fulfill(athlete.segments);
        }
      } else {
        console.log('\n\nDID NOT WORK IN UPDATING LIST OF Segments\n\n');
        console.log(err);
        res.json({ err });
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

  return new Promise((fulfill, reject) => {
    const promises = Array.from(Array(athlete.listActivities.length).keys()).map((x) => { return listSegments(token, athlete.listActivities[x].id, athlete); });
    Promise.all(promises)
    .then((segments) => {
      // const newSegmentList = segmentList.reduce((prev, curr) => {
      //   return prev.concat(curr);
      // });
      // console.log('\n\n NEW Segment LIST', newSegmentList);

      // ****** const list = athlete.listSegments.concat(newSegmentList);

      // console.log('segments updated');
      // console.log('THIS IS THE NEW LIST of segments : ', list);

      // athlete.segments = segments;
      console.log(athlete);
      fulfill(athlete);
    })
    .catch((error) => {
      console.log('the error is in get segments');
      console.log(error);
      reject(error);
    });
  });
}
