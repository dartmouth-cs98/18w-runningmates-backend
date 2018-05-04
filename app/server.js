import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';

import apiRouter from './router';
import * as chatActions from './controllers/chat_controller';

// initialize
// DB Setup
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/runningmates';
mongoose.connect(mongoURI);
// set mongoose promises to es6 default
mongoose.Promise = global.Promise;
const app = express();

// enable/disable cross origin resource sharing if necessary
app.use(cors());

app.set('view engine', 'ejs');
app.use(express.static('static'));
// enables static assets from folder static
app.set('views', path.join(__dirname, '../app/views'));
// this just allows us to render ejs from the ../app/views directory

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', apiRouter);


// // default index route
// app.get('/', (req, res) => {
//   res.sendFile(`${__dirname}/index.html`);
//   // res.send('hi this is your Running mate');
// });

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
// START THE SERVER
// for chat, from tutorial: https://socket.io/get-started/chat/
// https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen
// =============================================================================
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(port);

app.get('/', (req, res) => {
  res.json({ message: 'welcome to running mates!' });
});


const userDictionary = {};
const clients = [];


io.on('connection', (socket) => {
  console.log('a user connected');
  clients.push(socket.id);

  socket.on('login', (userInfo) => {
    // need to check if user is signed in on another device already
    console.log('login socket');
    userDictionary[userInfo] = socket.id;
    console.log(userDictionary);
  });

  socket.on('logout', (userInfo) => {
    // remove user/associated device from dictionary
    delete userDictionary[userInfo];
  });

  // join a room identified by the chat ID
  // code related to joining rooms developed with help from: https://gist.github.com/crtr0/2896891
  socket.on('join room', (chatID) => {
    console.log(`joining room ${chatID}`);

    // leave room user was previously in
    if (socket.room) {
      socket.leave(socket.room);
    }

    socket.room = chatID;
    socket.join(chatID);
  });

  socket.on('chat message', (msg) => {
    const room = msg.chatID;
    const recipient = msg.recipient;
    const socketid = userDictionary[recipient];

    io.sockets.in(room).emit('chat message', msg);
    console.log(`SOCKET ID: ${socketid}`);
    console.log(io.sockets.connected);
    chatActions.saveNewMessage(msg, () => {
      // https://stackoverflow.com/questions/24041220/sending-message-to-a-specific-id-in-socket-io-1-0

      console.log("SOCKET ID: " + socketid);
      console.log(io.sockets.connected);

      if (io.sockets.connected[socketid]) {
        console.log(`socket ${socketid}is connected`);
        io.sockets.connected[socketid].emit('message', 'hey, you got a message!');
      }
    });
  });
});

console.log(`listening on: ${port}`);
