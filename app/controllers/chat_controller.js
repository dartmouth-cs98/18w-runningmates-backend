import Message from '../models/chat';

export const saveMessage = (req, res, next) => {
  let time = Date.Now;
  let message = req.message;
  let sentBy = req.user;
  let chatID = req.chatID;

  const message = new Message();
}
