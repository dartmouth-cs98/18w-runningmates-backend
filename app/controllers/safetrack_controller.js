
import jwt from 'jwt-simple';

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// client.messages.create({
//   from: process.env.TWILIO_PHONE_NUMBER,
//   to: process.env.CELL_PHONE_NUMBER,
//   body: "You just sent an SMS from Node.js using Twilio!"
// }).then((messsage) => console.log(message.sid));

export const sendText = (req, res) => {
  console.log('gonna send a text');
  console.log(req.body);
  client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: req.body.toPhoneNumber,
    body: req.body.message,
  }).then((message) => console.log(message.sid));

};

export const something = 5;
