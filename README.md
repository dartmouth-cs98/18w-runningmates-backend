# RunningMates Backend Service
TODO: short project description, some sample screenshots or mockups
### Project Description
RunningMates is a mobile application that utilizes various third-party APIs to compile personal fitness data to connect individuals looking for new connections with others who share their passions in various outdoor activities. The application will use state-of-art data analytic techniques to provide users with the best recommendations of events and people in their area, based on their skill levels and preferences.

This repository contains the backend solution for the app, including the current server and database setup. The backend service will store user accounts, manage authentication for third party app (ex: Strava) users, and handle user data for use in the recommendation algorithm.

## Architecture

TODO:  descriptions of code organization and tools and libraries used

### Database & Server
The current database is built using MongoDB. The module Mongoose is used an object model that connects the database to the application, with custom controllers for interacting with various data objects.
The server was built using the Express web framework for managing CRUD-style requests to the database.

### Dependencies
    "babel-cli": "^6.24.1",
    "babel-preset-es2015": "^6.24.1",
    "babel-preset-stage-2": "^6.24.1",
    "bcrypt-nodejs": "0.0.3",
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.17.1",
    "cors": "^2.8.3",
    "dotenv": "^5.0.0",
    "ejs": "^2.5.6",
    "express": "^4.16.2",
    "jwt-simple": "^0.5.1",
    "mongod": "^2.0.0",
    "mongoose": "^5.0.3",
    "passport": "^0.4.0",
    "passport-jwt": "^3.0.1",
    "passport-local": "^1.0.0"

## Setup

TODO: how to get the project dev environment up and running, npm install etc
* Git clone this repo into your local directory.

### For Macs:
* Install Homebrew.
* Install npm through Homebrew.
* Change directory into where the repo is located, and run `npm install` on terminal.
* In the the root directory of the repo on your local machine, save `AUTH_SECRET="somerweklhjhdf9879av8v928cjka asdflkaj889"` into a .env file (title it only '.env').

#### If Mongo is not on your machine 
* With the `mongodb` binaries now installed, on terminal run `mkdir -p /data/db` to create the mongo database directory.
*  On OSX if you get a permissions error you need to make sure that the database dir is writable. Run `sudo chown $USER /data/db` in terminal if this is an issue.

## Deployment
* Open a terminal window and run `mongod` 
* In a separate terminal window from the root of the repo directory on your local machine, run `npm run dev`

## Authors
* Brian Francis
* Jonathan Gonzalez
* Divya Kalidindi
* Sara Topic
* Drew Waterman
* Shea Wojciehowski

## Acknowledgments
* The team acknowledges Tim Tregubov.
