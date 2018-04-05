import Chat from '../models/chats';
import Message from '../models/messages';

export const saveNewMessage = (msg) => {
  let time = Date.Now;
  let message = msg.message;
  let sentBy = msg.user;
  let chatID = msg.chatID;
  let recipient = msg.recipient;

  console.log("message is: " + message);

  const newMessage = new Message();
  newMessage.time = time;
  newMessage.message = message;
  newMessage.sentBy = sentBy;
  newMessage.chatID = chatID;

  newMessage.save().then((result) => {
    console.log("message saved successfully");

    // create a new chat
    if (!chatID) {
      console.log("creating new chat");
      let newChat = Chat();
      newChat.members = [];
      newChat.members.push(sentBy);
      newChat.members.push(recipient);
      newChat.messages = [];
      newChat.messages.push(result.id)

      console.log("members: " + newChat.members);
      console.log("messages: " + newChat.messages);

      newChat.save().then(() => {
        console.log("saved new chat successfully");
      }).catch((err) => {
        console.log("error saving new chat: " + err);
      });
    } else {
      Chat.findOne({_id: chatID}).then((result) => {
        if (!result) {
          // create new chat? or throw error?
          console.log("found chat " + chatID);
        } else {
          console.log("didn't find chat for some reason");
        }
      }).catch((err) => {
        console.log("error finding chat")
      });
    }
  }).catch((err) => {
    console.log("error saving message: " + err);
  });

}
