import mongoose, { Schema } from 'mongoose';


const MessageSchema = new Schema({
  time: Date,
  message: String,
  sentBy: String,
  chatID: String,
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
