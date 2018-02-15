'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MessageSchema = new _mongoose.Schema({
  time: String,
  message: String,
  sentBy: String
});

var ChatSchema = new _mongoose.Schema({
  Members: [],
  Messages: [MessageSchema]
}, {
  toJSON: {
    virtuals: true
  }
});

// create model class
var ChatModel = _mongoose2.default.model('Chat', ChatSchema);

exports.default = ChatModel;