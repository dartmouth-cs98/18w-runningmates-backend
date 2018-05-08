'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _chat_controller = require('./controllers/chat_controller');

var chatActions = _interopRequireWildcard(_chat_controller);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// initialize
// DB Setup
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/runningmates';
_mongoose2.default.connect(mongoURI);
// set mongoose promises to es6 default
_mongoose2.default.Promise = global.Promise;
var app = (0, _express2.default)();

// enable/disable cross origin resource sharing if necessary
app.use((0, _cors2.default)());

app.set('view engine', 'ejs');
app.use(_express2.default.static('static'));
// enables static assets from folder static
app.set('views', _path2.default.join(__dirname, '../app/views'));
// this just allows us to render ejs from the ../app/views directory

// enable json message body for posting data to API
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use(_bodyParser2.default.json());

app.use('/api', _router2.default);

// // default index route
// app.get('/', (req, res) => {
//   res.sendFile(`${__dirname}/index.html`);
//   // res.send('hi this is your Running mate');
// });

// START THE SERVER
// =============================================================================
var port = process.env.PORT || 9090;
// START THE SERVER
// for chat, from tutorial: https://socket.io/get-started/chat/
// https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen
// =============================================================================
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(port);

app.get('/', function (req, res) {
  res.json({ message: 'welcome to running mates!' });
});

var userDictionary = {};
var clients = [];

io.on('connection', function (socket) {
  console.log('a user connected');
  clients.push(socket.id);

  socket.on('login', function (userInfo) {
    // need to check if user is signed in on another device already
    console.log('login socket');
    userDictionary[userInfo] = socket.id;
    console.log(userDictionary);
  });

  socket.on('logout', function (userInfo) {
    // remove user/associated device from dictionary
    delete userDictionary[userInfo];
  });

  // join a room identified by the chat ID
  // code related to joining rooms developed with help from: https://gist.github.com/crtr0/2896891
  socket.on('join room', function (chatID) {
    console.log('joining room ' + chatID);

    // leave room user was previously in
    if (socket.room) {
      socket.leave(socket.room);
    }

    socket.room = chatID;
    socket.join(chatID);
  });

  socket.on('chat message', function (msg) {
    var room = msg.chatID;
    var recipient = msg.recipient;
    var socketid = userDictionary[recipient];

    io.sockets.in(room).emit('chat message', msg);
    console.log('SOCKET ID: ' + socketid);
    console.log(io.sockets.connected);
    chatActions.saveNewMessage(msg, function () {
      // https://stackoverflow.com/questions/24041220/sending-message-to-a-specific-id-in-socket-io-1-0
      if (io.sockets.connected[socketid]) {
        console.log('socket ' + socketid + 'is connected');
        io.sockets.connected[socketid].emit('message', 'hey, you got a message!');
      }
    });
  });
});

console.log('listening on: ' + port);