const socket = io();

function createRoom() {
	socket.emit('createRoom');
}

function joinRoom(evn) {
	const target = evn.target;
	let id = target.dataset.roomid;
	socket.emit('joinRoom', id);
	document.getElementById("roomNum").textContent = `Room ${id}`;
}

socket.on('initRoom', function(top, side) {
	actuallyMakeBoard(top, side)
	toVisible();
});

socket.on('updateRooms', function(roomList) {
	const rooms = document.getElementById("rooms");
	rooms.textContent = "";
	for(key of roomList) {
		const roomItem = document.createElement('li');
		roomItem.textContent = `Room ${key}`;
		roomItem.dataset.roomid = key;
		roomItem.addEventListener('click', joinRoom);
		rooms.appendChild(roomItem);
	}
});

socket.on('updateRoom', function() {
	
});

function actuallyMakeBoard(top, side) {
	const table = document.getElementById("table");
	table.innerHTML = "";

	const topRow = table.insertRow();
	topRow.insertCell();
	for(const stub of top) {
		const cell = topRow.insertCell();
		cell.innerText = stub.length > 0 ? stub.join('\n') : '0';
	}
	for(let r=0;r<10;r++) {
		const row = table.insertRow();
		const stub = row.insertCell();
		stub.innerText = side[r].length > 0 ? side[r].join(',') : '0';

		for(let c=0;c<10;c++) {
            cell = row.insertCell();
            cell.dataset.y = `${r}`
            cell.dataset.x = `${c}`
			cell.classList.add('unclicked');
			cell.addEventListener('click', handleClick);
			cell.addEventListener('contextmenu', handleRightClick, false);
		}
	}
}

function handleClick(evn) {
	const target = evn.target;
	if(target.classList.contains("unclicked")) {
		target.classList.replace("unclicked", "clicked");
	}
	else if(target.classList.contains("right-clicked")) {
		target.classList.replace("right-clicked", "clicked");
	}
	else {
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
	document.getElementById("board").classList.toggle('hid');
	document.getElementById("room").classList.toggle('hid');
}
