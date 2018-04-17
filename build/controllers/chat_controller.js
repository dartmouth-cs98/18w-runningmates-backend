'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChatHistory = exports.getChatsList = exports.saveNewMessage = undefined;

var _chats = require('../models/chats');

var _chats2 = _interopRequireDefault(_chats);

var _messages = require('../models/messages');

var _messages2 = _interopRequireDefault(_messages);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function compareByDate(msg1, msg2) {
  if (msg1.time < msg2.time) {
    return 1;
  }
  if (msg1.time > msg2.time) {
    return -1;
  }
  return 0;
}

var saveNewMessage = exports.saveNewMessage = function saveNewMessage(msg) {
  var time = Date.Now;
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
      newChat.members = [];
      newChat.members.push(sentBy);
      newChat.members.push(recipient);
      newChat.messages = [];
      newChat.messages.push(result.id);
      newChat.mostRecentMessage = result.id;

      newChat.save().then(function () {
        console.log('saved new chat successfully');
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
            mostRecentMessage: result.id
          }).then(function () {
            console.log('updated chat successfully');
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

  var userEmail = req.query.user;

  if (userEmail) {
    _chats2.default.find({ members: userEmail }).then(function (chats) {
      // let chatsResponse = Object.assign({}, chats);

      var outerPromiseArray = [];

      var innerPromiseArray = [];

      var _loop = function _loop(i) {
        var currentChat = JSON.parse(JSON.stringify(chats[i]));
        var innerPromiseArray = [];

        var outerPromise = new Promise(function (resl, rej) {
          var _loop2 = function _loop2(j) {
            if (currentChat.members[j] != userEmail) {

              var innerPromise = new Promise(function (resolve, reject) {
                var name = "";

                _user2.default.findOne({ email: currentChat.members[j] }).then(function (user) {
                  name += user.firstName + " " + user.lastName;
                  resolve(name);
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
            currentChat.recipients = recipients;
            resl(currentChat);
          });
        });
        outerPromiseArray.push(outerPromise);
      };

      for (var i = 0; i < chats.length; i++) {
        _loop(i);
      }
      Promise.all(outerPromiseArray).then(function (chatsResponse) {
        res.send(chatsResponse);
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
  var chatID = req.body.chatID;
  var pageNumber = req.body.pageNumber;

  _chats2.default.findOne({ _id: chatID }).then(function (result) {
    if (result) {
      (function () {
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
            var sortedObjects = messageObjects.sort(compareByDate);

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
      })();
    } else {
      console.log('couldn\'t find chat with ID ' + chatID);
    }
  }).catch(function (err) {
    console.log('error finding chat: ' + err);
  });
};