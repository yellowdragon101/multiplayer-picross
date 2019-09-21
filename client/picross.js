const socket = io();

function createRoom() {
	socket.emit('createRoom');
}

socket.on('updateRooms', function(roomList) {
    for(key of roomList) {
		const roomItem = document.createElement('li');
        roomItem.textContent = key;
        // roomLi.onclick = // something about joinRoom
        document.getElementById("rooms").appendChild(roomItem);
    }
});

let currBoard;
let answerCount;

function startGame() {
	let size = document.getElementById("size").value;
    let output = document.getElementById("err");
    output.textContent = "";
	if(size == null || size <= 0) {
        output.style.color = "red";
        output.textContent = "Enter a board size.";
        return;
    }
	currBoard = makeBoard(size);
	const top = getTop(currBoard);
	const side = getSide(currBoard);
	actuallyMakeBoard(currBoard, top, side);
    answerCount = 0;
}

function actuallyMakeBoard(board, top, side) {
	const table = document.getElementById("table");
	table.innerHTML = "";

	const topRow = table.insertRow();
	topRow.insertCell();
	for(const stub of top) {
		const cell = topRow.insertCell();
		cell.innerText = stub.length > 0 ? stub.join('\n') : '0';
	}
	for(let r=0;r<board.length;r++) {
		const row = table.insertRow();
		const stub = row.insertCell();
		stub.innerText = side[r].length > 0 ? side[r].join(',') : '0';

		for(let c=0;c<board[0].length;c++) {
            cell = row.insertCell();
            cell.dataset.y = `${r}`
            cell.dataset.x = `${c}`
			cell.classList.add('unclicked');
			cell.addEventListener('click', handleClick);
			cell.addEventListener('contextmenu', handleRightClick, false);
		}
	}
}

function makeBoard(size) {
	let board = [];
	for(let y=0;y<size;y++) {
		board.push([]);
		for(let x=0;x<size;x++) {
			board[y][x] = randInt();
		}
	}
	return board;
}

function randInt() {
	return Math.round(Math.random());
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

function handleClick(evn) {
	const target = evn.target;
	if(target.classList.contains("unclicked")) {
        if(currBoard[target.dataset.y][target.dataset.x] == 1) answerCount += 1;
		target.classList.replace("unclicked", "clicked");
	}
	else if(target.classList.contains("right-clicked")) {
		target.classList.replace("right-clicked", "clicked");
	}
	else {
        if(currBoard[target.dataset.y][target.dataset.x] == 1) answerCount -= 1;
		target.classList.replace("clicked", "unclicked");
    }
}

function handleRightClick(evn) {
	evn.preventDefault();
	const target = evn.target;

	if(target.classList.contains("unclicked")) {
		target.classList.replace("unclicked", "right-clicked");
	}
	else if(target.classList.contains("clicked")) {
		target.classList.replace("clicked", "right-clicked");
	}
	else {
		target.classList.replace("right-clicked", "unclicked");
    }

	return false;
}

function toVisible() {
	const board = document.getElementById("board");
	const room = document.getElementById("room");
	if(board.classList.contains("hid")) {
		board.classList.toogle('hid', bool);
	}
	else if(room.classList.contains("hid")) {
		room.classList.toogle('hid', bool);
	}
}

function checkAnswer() {
    let count = 0;
    const output = document.getElementById("err");

	for(row of currBoard) {
        for(val of row) {
            if(val == 1) count += 1
        }
    }
    output.style.color = "black";
    output.textContent = `${count - (count - answerCount)}/${count} tiles correct.`;
}