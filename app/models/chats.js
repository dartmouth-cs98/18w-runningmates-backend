import mongoose, { Schema } from 'mongoose';


const MessageSchema = new Schema({
  time: String,
  message: String,
  sentBy: String,
});

const ChatSchema = new Schema({
  Members: [],
  Messages: [MessageSchema],
}, {
  toJSON: {
    virtuals: true,
  },
});

// create model class
const ChatModel = mongoose.model('Chat', ChatSchema);

export default ChatModel;
