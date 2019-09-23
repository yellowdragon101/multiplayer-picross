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
		io.emit(Object.keys(roomList));
	});
	socket.on('createRoom', function(roomNum) {
		roomNum = Object.keys(rooms).length + 1;
		console.log(`room #${roomNum} created`);
		rooms[roomNum] = {players: [socket], board: [], top: [], side: []};

		let board = rooms[roomNum]["board"];
		board = makeBoard(10);
		rooms[roomNum]["top"] = getTop(board);
		rooms[roomNum]["side"] = getSide(board);
		
		io.emit('updateRooms', Object.keys(rooms));
	});
	socket.on('joinRoom', function(roomID) {
		console.log(`user joined room ${roomID}`);
		io.emit('initRoom', rooms[roomID]["top"], rooms[roomID]["side"]);
	});
	socket.on('initRoom', function(top, side) {
		io.emit(top, side);
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

function makeBoard(size) {
	let board = [];
	for(let y=0;y<size;y++) {
		board.push([]);
		for(let x=0;x<size;x++) {
			board[y][x] = Math.round(Math.random());
		}
	}
	return board;
}

function getTop(grid) {
	const cols = grid[0].map((col,i) => grid.map((row) => row[i]));
	return cols.map((col) => stubValues(col));
}

function getSide(grid) {
	const rows = grid;
	return rows.map((row) => stubValues(row));
}

function stubValues(arr) {
	const values = [arr[0]];
    for(let i=1;i<arr.length;i++) {	
        arr[i] == 0 ? values.push(arr[i]) : values[values.length - 1] += 1;
	}
	return filterZero(values);
}

function filterZero(arr) {
	return arr.filter((x) => x != 0);
}