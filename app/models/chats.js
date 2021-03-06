import mongoose, { Schema } from 'mongoose';

const ChatSchema = new Schema({
  members: [],
  messages: [{type: Schema.ObjectId, ref: 'Message'}],
  mostRecentMessage: String,
  lastUpdated: Date,
}, {
  toJSON: {
    virtuals: true,
  },
});

// create model class
const ChatModel = mongoose.model('Chat', ChatSchema);

export default ChatModel;
