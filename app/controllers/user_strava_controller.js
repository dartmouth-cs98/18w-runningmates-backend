import jwt from 'jwt-simple';

import UserStrava from '../models/userStrava';
import config from '../config';
import strava3 from 'strava-v3';


export const getData = (req, res, next) => {
	var token = req.body.token;
	var strava = require('strava-v3');
	var athlete = new UserStrava(); 

	strava.athlete.get({id:token},function(err,payload,limits) {
	    if(!err) {
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
	    // 		if (err) return console.error(err);
	    // 		//res.json(athlete);
	  		// });

	    }
	    else {
	        console.log(err);
	    }
	});


		// Basic athlete statistics 
	strava.athletes.stats({id:token},function(err,payload,limits) {
	    if(!err) {
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
	        console.log("printing new athlete");
			console.log(athlete);
		    athlete.save(function (err, athlete) {
				if (err) return console.error(err);
				//res.json(athlete);
		  	});
	    }
	    else {
	        console.log(err);
	    }
	});

	// console.log("printing new athlete");
	// console.log(athlete);
 //    athlete.save(function (err, athlete) {
	// 	if (err) return console.error(err);
	// 	//res.json(athlete);
 //  	});


	console.log("here");
	UserStrava.find(function (err, athletes) {
		console.log("here");
		if (err) return console.error(err);
		console.log(athletes);
	});
};

