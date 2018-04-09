import Chat from '../models/chats';
import Message from '../models/messages';


function compareByDate(msg1, msg2) {
  if (msg1.time < msg2.time) { return 1; }
  if (msg1.time > msg2.time) { return -1; }
  return 0;
}

export const saveNewMessage = (msg) => {
  const time = Date.Now;
  const message = msg.message;
  const sentBy = msg.user;
  const chatID = msg.chatID;
  const recipient = msg.recipient;

  console.log(`message is: ${message}`);

  const newMessage = new Message();
  newMessage.time = time;
  newMessage.message = message;
  newMessage.sentBy = sentBy;
  newMessage.chatID = chatID;

  newMessage.save().then((result) => {
    console.log('message saved successfully');

    // create a new chat
    if (!chatID) {
      console.log('creating new chat');
      const newChat = Chat();
      newChat.members = [];
      newChat.members.push(sentBy);
      newChat.members.push(recipient);
      newChat.messages = [];
      newChat.messages.push(result.id);

      console.log(`members: ${newChat.members}`);
      console.log(`messages: ${newChat.messages}`);

      newChat.save().then(() => {
        console.log('saved new chat successfully');
      }).catch((err) => {
        console.log(`error saving new chat: ${err}`);
      });
    } else {
      Chat.findOne({ _id: chatID }).then((chat) => {
        if (result) {
          console.log(`found chat ${chatID}`);
          const currentMessages = chat.messages;
          currentMessages.push(result);
          Chat.update({ _id: chatID }, {
            messages: currentMessages,
          }).then(() => {
            console.log('updated chat successfully');
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


export const getChatHistory = (req, res, next) => {
  const chatID = req.body.chatID;
  const pageNumber = req.body.pageNumber;

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
          const sortedObjects = messageObjects.sort(compareByDate);

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
