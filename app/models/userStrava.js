import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const UserStravaSchema = new Schema({
  id: Number,
  rmId: Number,
  email: String, 
  username: String, 
  sex: String, 
  firstName: String,
  lastName: String,
  athlete_type: Number,
  rRecentCount: String,
  rRecentDistance: Number,
  rRecentMovingTime: Number,
  rTotalCount: Number,
  rTotalDistance: Number,
  rTotalMovingTime: Number,
  rTotalElapsedTime: Number,
  rTotalElevationGain: Number,
  bRecentCount: String,
  bRecentDistance: Number,
  bRecentMovingTime: Number,
  bTotalCount: Number,
  bTotalDistance: Number,
  bTotalMovingTime: Number,
  bTotalElapsedTime: Number,
  bTotalElevationGain: Number,
  sRecentCount: String,
  sRecentDistance: Number,
  sRecentMovingTime: Number,
  sTotalCount: Number,
  sTotalDistance: Number,
  sTotalMovingTime: Number,
  sTotalElapsedTime: Number,
  sTotalElevationGain: Number,
  koms: [],
  listActivities: [{ id: String, name: String }],
  listSegments:[{title: String, id: String, elapsedTime: Number, prRank: String, distance: Number, komRank: Number, count: Number}]
});


const UserStrava = mongoose.model('UserStrava', UserStravaSchema);

export default UserStrava;
