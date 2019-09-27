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
	socket.on('createRoom', function() {
		let roomID = Object.keys(rooms).length + 1;
		console.log(`room #${roomID} created`);
		rooms[roomID] = {players: [socket], board: [], top: [], side: [], boardState: []};

		rooms[roomID]["boardState"] = makeBoard2(10);
		
		let board = rooms[roomID]["board"];
		board = makeBoard(10);
		rooms[roomID]["top"] = getTop(board);
		rooms[roomID]["side"] = getSide(board);
		
		rooms[roomID]["players"][0].emit('joinRoom', roomID);
		io.emit('updateRooms', Object.keys(rooms));
		socket.emit('initRoom', rooms[roomID].top, rooms[roomID].side);
	});
	socket.on('joinRoom', function(roomID) {
		console.log(`user joined room ${roomID}`);
		rooms[roomID]["players"] = [socket];
		for(val of rooms[roomID]["players"]) {
			val.emit(roomID, 'initRoom', rooms[roomID]["top"], rooms[roomID]["side"]);
		}
	});
	socket.on('initRoom', function(roomID, top, side) {
		io.emit(roomID, top, side);
	});
	socket.on('updateRoom', function(roomID,x,y,clickType,top,side) {
		rooms[roomID]["boardState"][y][x] = clickType;
		
		for(val of rooms[roomID]["players"]) {
			val.emit(rooms[roomID]["top"],rooms[roomID]["side"],rooms[roomID][boardState]);
		}
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

function makeBoard2(size) {
	let board = [];
	for(let y=0;y<size;y++) {
		board.push([]);
		for(let x=0;x<size;x++) {
			board[y][x] = "";
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