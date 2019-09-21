const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

let rooms = {};
io.on('connection', function(socket) {
  console.log('a user connected');
  io.emit('updateRooms', Object.keys(rooms));
  socket.on('updateRooms', function(roomList) {
	roomList = rooms;
	io.emit(Object.keys(roomList));
  });
  socket.on('createRoom', function(roomNum) {
    roomNum = Object.keys(rooms).length + 1;
    console.log(`room #${roomNum} created`);
    rooms[roomNum] = {players: [socket]};
    io.emit('updateRooms', Object.keys(rooms));
  });
  socket.on('updateRoom', function() {

  });
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

http.listen(port, function() {
  console.log(`listening on *:${port}`);
});