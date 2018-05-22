'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChatHistory = exports.getChatsList = exports.saveNewMessage = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _chats = require('../models/chats');

var _chats2 = _interopRequireDefault(_chats);

var _messages = require('../models/messages');

var _messages2 = _interopRequireDefault(_messages);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// sorts in reverse order; newer messages sorted to end of array
function compareMessagesByTime(msg1, msg2) {
  if (msg1.time > msg2.time) {
    return 1;
  }
  if (msg1.time < msg2.time) {
    return -1;
  }
  return 0;
}

function compareChatsByTime(chat1, chat2) {
  if (chat1.lastUpdated < chat2.lastUpdated) {
    return 1;
  }
  if (chat1.lastUpdated > chat2.lastUpdated) {
    return -1;
  }
  return 0;
}

var saveNewMessage = exports.saveNewMessage = function saveNewMessage(msg, cb) {
  var time = Date.now();
  var message = msg.message;
  var sentBy = msg.sentBy;
  var chatID = msg.chatID;
  var recipient = msg.recipient;

  var newMessage = new _messages2.default();
  newMessage.time = time;
  newMessage.message = message;
  newMessage.sentBy = sentBy;
  newMessage.chatID = chatID;

  newMessage.save().then(function (result) {
    // create a new chat
    if (!chatID) {
      var newChat = (0, _chats2.default)();
      newChat.members = [sentBy, recipient];
      newChat.messages = [];
      newChat.messages.push(result.id);
      newChat.mostRecentMessage = message;
      newChat.lastUpdated = time;

      newChat.save().then(function () {
        console.log('saved new chat successfully');
        cb();
      }).catch(function (err) {
        console.log('error saving new chat: ' + err);
      });
    } else {
      _chats2.default.findOne({ _id: chatID }).then(function (chat) {
        if (result) {
          var currentMessages = chat.messages;
          currentMessages.push(result.id);
          _chats2.default.update({ _id: chatID }, {
            messages: currentMessages,
            mostRecentMessage: message,
            lastUpdated: time
          }).then(function () {
            console.log('updated chat successfully');
            cb();
          }).catch(function (err) {
            console.log('error updating chat');
            console.log(err);
          });
        } else {
          // create new chat? or throw error?
          console.log('didn\'t find chat for some reason');
        }
      }).catch(function (err) {
        console.log('error finding chat');
      });
    }
  }).catch(function (err) {
    console.log('error saving message: ' + err);
  });
};

var getChatsList = exports.getChatsList = function getChatsList(req, res) {

  var userID = req.user._id.toString();
  console.log("getting chats for " + userID);

  if (userID) {
    _chats2.default.find({ members: userID }).then(function (chats) {
      // let chatsResponse = Object.assign({}, chats);

      var outerPromiseArray = [];

      var innerPromiseArray = [];

      var _loop = function _loop(i) {
        var currentChat = JSON.parse(JSON.stringify(chats[i]));
        var innerPromiseArray = [];

        var outerPromise = new Promise(function (resl, rej) {
          var _loop2 = function _loop2(j) {
            if (currentChat.members[j] != userID) {

              var innerPromise = new Promise(function (resolve, reject) {
                // let name = "";

                _user2.default.findOne({ _id: currentChat.members[j] }).then(function (user) {
                  // name += user.firstName + " " + user.lastName;
                  resolve(user);
                }).catch(function (err) {
                  console.log("error finding user " + currentChat.members[j]);
                  reject(err);
                });
              });
              innerPromiseArray.push(innerPromise);
            }
          };

          for (var j = 0; j < currentChat.members.length; j++) {
            _loop2(j);
          }
          Promise.all(innerPromiseArray).then(function (recipients) {
            var names = [];
            var ids = [];

            for (var _i = 0; _i < recipients.length; _i++) {
              var name = recipients[_i].firstName + " " + recipients[_i].lastName;
              var id = recipients[_i].id;
              names.push(name);
              ids.push(id);
            }

            currentChat.recipients = names;
            currentChat.recipientIDs = ids;
            if (recipients.length > 0) {
              currentChat.imageURL = recipients[0].imageURL;
            }

            resl(currentChat);
          });
        });
        outerPromiseArray.push(outerPromise);
      };

      for (var i = 0; i < chats.length; i++) {
        _loop(i);
      }
      Promise.all(outerPromiseArray).then(function (chatsResponse) {
        // sort by date/time here first before sending the response
        var sortedChats = chatsResponse.sort(compareChatsByTime);

        for (var i = 0; i < sortedChats.length; i++) {
          var chatTime = new Date(sortedChats[i].lastUpdated);
          var now = new Date();

          var chatYear = chatTime.getFullYear();
          var chatMonth = chatTime.getMonth();
          var chatDay = chatTime.getDate();

          if (chatDay != now.getDate() || chatMonth != now.getMonth() || chatYear != now.getFullYear()) {
            sortedChats[i].lastUpdated = chatMonth + "/" + chatDay + "/" + chatYear;
          } else {
            sortedChats[i].lastUpdated = chatTime.getHours() + ":" + chatTime.getMinutes();
          }
        }

        // console.log("------BEFORE SENDING-----");
        // console.log(sortedChats);
        res.send(sortedChats);
      });
    }).catch(function (err) {
      console.log("error fetching chats");
      console.log(err);
    });
  } else {
    console.log("invalid user email");
    res.send("invalid user email");
  }
};

var getChatHistory = exports.getChatHistory = function getChatHistory(req, res, next) {
  var chatID = req.query.chatID;
  var pageNumber = req.query.pageNumber;
  var userID = req.user._id.toString();
  console.log("fetching chats for: " + userID);

  _chats2.default.findOne({ _id: chatID }).then(function (result) {
    if (result) {
      var _ret3 = function () {

        if (!result.members.includes(userID)) {
          return {
            v: res.status(401).send("Unauthorized")
          };
        }

        var messageIDs = result.messages;
        var promisesArray = [];

        // add all messages in the chat to the messageObjects array

        var _loop3 = function _loop3(i) {
          var promise = new Promise(function (resolve, reject) {
            _messages2.default.findOne({ _id: messageIDs[i] }).then(function (msg) {
              resolve(msg);
            }).catch(function (err) {
              console.log('error fetching message with id ' + messageIDs[i]);
              console.log(error);
              reject(error);
            });
          });
          promisesArray.push(promise);
        };

        for (var i = 0; i < messageIDs.length; i++) {
          _loop3(i);
        }

        Promise.all(promisesArray).then(function (messageObjects) {
          if (messageObjects) {
            // sort the messageObjects array
            var sortedObjects = messageObjects.sort(compareMessagesByTime);

            // this if statement is not quite tested yet
            if (pageNumber) {
              var numObjects = sortedObjects.length;

              // load 15 messages at a time
              var numMessagesPerPage = 15;

              var chatStart = pageNumber * numMessagesPerPage;
              if (chatStart > numObjects) {
                chatStart = numObjects - numMessagesPerPage;
              }
              var chatEnd = chatStart + numMessagesPerPage + 1;
              if (chatEnd > numObjects) {
                chatEnd = numObjects;
              }
              var _messageObjects = sortedObjects.slice(chatStart, chatEnd);
            }
            res.send(messageObjects);
          }
        }).catch(function (err) {
          console.log('error resolving promise array');
          console.log(err);
        });
      }();

      if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
    } else {
      console.log('couldn\'t find chat with ID ' + chatID);
      return res.send("Error fetching chats");
    }
  }).catch(function (err) {
    console.log('error finding chat: ' + err);
  });
};