import Chat from '../models/chats';
import Message from '../models/messages';
import User from '../models/user';

// sorts in reverse order; newer messages sorted to end of array
function compareMessagesByTime(msg1, msg2) {
  if (msg1.time > msg2.time) { return 1; }
  if (msg1.time < msg2.time) { return -1; }
  return 0;
}

function compareChatsByTime(chat1, chat2) {
  if (chat1.lastUpdated < chat2.lastUpdated) { return 1; }
  if (chat1.lastUpdated > chat2.lastUpdated) { return -1; }
  return 0;
}

export const saveNewMessage = (msg, cb) => {
  const time = Date.now();
  const message = msg.message;
  const sentBy = msg.sentBy;
  const chatID = msg.chatID;
  const recipient = msg.recipient;

  const newMessage = new Message();
  newMessage.time = time;
  newMessage.message = message;
  newMessage.sentBy = sentBy;
  newMessage.chatID = chatID;

  newMessage.save().then((result) => {
    // create a new chat
    if (!chatID) {
      const newChat = Chat();
      newChat.members = [sentBy, recipient];
      newChat.messages = [];
      newChat.messages.push(result.id);
      newChat.mostRecentMessage = message;
      newChat.lastUpdated = time;

      newChat.save().then(() => {
        console.log('saved new chat successfully');
        cb();
      }).catch((err) => {
        console.log(`error saving new chat: ${err}`);
      });
    } else {
      Chat.findOne({ _id: chatID }).then((chat) => {
        if (result) {
          const currentMessages = chat.messages;
          currentMessages.push(result.id);
          Chat.update({ _id: chatID }, {
            messages: currentMessages,
            mostRecentMessage: message,
            lastUpdated: time,
          }).then(() => {
            console.log('updated chat successfully');
            cb();
          }).catch((err) => {
            console.log('error updating chat');
            console.log(err);
          });
        } else {
          // create new chat? or throw error?
          console.log('didn\'t find chat for some reason');
        }
      }).catch((err) => {
        console.log('error finding chat');
      });
    }
  }).catch((err) => {
    console.log(`error saving message: ${err}`);
  });
};


export const getChatsList = (req, res) => {

  let userID = req.query.user;

  if (userID) {
    Chat.find({members: userID}).then((chats) => {
      // let chatsResponse = Object.assign({}, chats);

      let outerPromiseArray = [];

      let innerPromiseArray = [];
      for (let i = 0; i < chats.length; i++) {
        let currentChat = JSON.parse(JSON.stringify(chats[i]));
        let innerPromiseArray = [];

        const outerPromise = new Promise((resl, rej) => {

          for (let j = 0; j < currentChat.members.length; j++) {
            if (currentChat.members[j] != userID) {

              const innerPromise = new Promise((resolve, reject) => {
                // let name = "";

                User.findOne({_id: currentChat.members[j]}).then((user) => {
                  // name += user.firstName + " " + user.lastName;
                  resolve(user);
                }).catch((err) => {
                  console.log("error finding user " + currentChat.members[j]);
                  reject(err);
                });
              });
              innerPromiseArray.push(innerPromise);
            }
          }
          Promise.all(innerPromiseArray).then((recipients) => {
            let names = [];

            for (let i = 0; i < recipients.length; i++) {
              let name = recipients[i].firstName + " " + recipients[i].lastName;
              names.push(name);
            }

            currentChat.recipients = names;
            if (recipients.length > 0) {
              currentChat.imageURL = recipients[0].imageURL
            }

            resl(currentChat);
          });
        });
      outerPromiseArray.push(outerPromise);
    }
      Promise.all(outerPromiseArray).then((chatsResponse) => {
        // sort by date/time here first before sending the response
        let sortedChats = chatsResponse.sort(compareChatsByTime);

        for (let i = 0; i < sortedChats.length; i++) {
          let chatTime = new Date(sortedChats[i].lastUpdated);
          let now = new Date();

          let chatYear = chatTime.getFullYear();
          let chatMonth = chatTime.getMonth();
          let chatDay = chatTime.getDate();

          if (chatDay != now.getDate() || chatMonth != now.getMonth() || chatYear != now.getFullYear()) {
            sortedChats[i].lastUpdated = chatMonth + "/" + chatDay + "/" + chatYear;
          } else {
            sortedChats[i].lastUpdated = chatTime.getHours() + ":" + chatTime.getMinutes();
          }
        }

        console.log("------BEFORE SENDING-----");
        console.log(sortedChats);
        res.send(sortedChats);
      });
    }).catch((err) => {
      console.log("error fetching chats");
      console.log(err);
    });
  } else {
    console.log("invalid user email");
    res.send("invalid user email");
  }
}



export const getChatHistory = (req, res, next) => {
  const chatID = req.query.chatID;
  const pageNumber = req.query.pageNumber;

  Chat.findOne({ _id: chatID }).then((result) => {
    if (result) {
      const messageIDs = result.messages;
      const promisesArray = [];

      // add all messages in the chat to the messageObjects array
      for (let i = 0; i < messageIDs.length; i++) {
        const promise = new Promise((resolve, reject) => {
          Message.findOne({ _id: messageIDs[i] }).then((msg) => {
            resolve(msg);
          }).catch((err) => {
            console.log(`error fetching message with id ${messageIDs[i]}`);
            console.log(error);
            reject(error);
          });
        });
        promisesArray.push(promise);
      }

      Promise.all(promisesArray).then((messageObjects) => {
        if (messageObjects) {
          // sort the messageObjects array
          const sortedObjects = messageObjects.sort(compareMessagesByTime);

          // this if statement is not quite tested yet
          if (pageNumber) {
            const numObjects = sortedObjects.length;

            // load 15 messages at a time
            const numMessagesPerPage = 15;

            let chatStart = pageNumber * numMessagesPerPage;
            if (chatStart > numObjects) {
              chatStart = numObjects - numMessagesPerPage;
            }
            let chatEnd = chatStart + numMessagesPerPage + 1;
            if (chatEnd > numObjects) {
              chatEnd = numObjects;
            }
            const messageObjects = sortedObjects.slice(chatStart, chatEnd);
          }
          res.send(messageObjects);
        }
      }).catch((err) => {
        console.log('error resolving promise array');
        console.log(err);
      });
    } else {
      console.log(`couldn't find chat with ID ${chatID}`);
    }
  }).catch((err) => {
    console.log(`error finding chat: ${err}`);
  });
};
