import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const UserStravaSchema = new Schema({
  id: Number,
  recentCount: String,
  recentDistance: Number,
  recentMovingTime: Number,
  totalCount: Number,
  totalDistance: Number,
  totalMovingTime: Number,
  totalElapsedTime: Number,
  totalElevationGain: Number,
  koms: [],
  listActivities: [],
  listSegments: [{ title: String, id: String, count: Number, pr: String }],
});


const UserStrava = mongoose.model('UserStrava', UserStravaSchema);

export default UserStrava;
