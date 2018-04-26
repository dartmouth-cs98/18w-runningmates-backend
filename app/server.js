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

io.on('connection', (socket) => {
  console.log('a user connected');

  // join a room identified by the chat ID
  // code related to joining rooms developed with help from: https://gist.github.com/crtr0/2896891
  socket.on('join room', function(chatID) {
    console.log("joining room " + chatID);

    // leave room user was previously in
    if (socket.room) {
      socket.leave(socket.room)
    }

    socket.room = chatID
    socket.join(chatID);
  });

  socket.on('chat message', (msg) => {
    let room = msg.chatID;
    console.log("room: " + room);

    console.log(`message: ${msg}`);
    io.sockets.in(room).emit('chat message', msg);
    chatActions.saveNewMessage(msg);
  });
});

console.log(`listening on: ${port}`);
