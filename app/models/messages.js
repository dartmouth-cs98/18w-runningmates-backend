import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema({
  time: Date,
  message: String,
  sentBy: String,
  chatID: String,
});


const MessageModel = mongoose.model('Message', MessageSchema);

export default MessageModel;
