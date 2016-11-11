
var canvas,
	ctx,
	localPlayer,
	remotePlayers,
	socket;

function init() {
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	keys = new Keys();

	var startX = Math.round(Math.random()*(canvas.width-5)),
		startY = Math.round(Math.random()*(canvas.height-5));

	localPlayer = new Player(startX, startY);

	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});

	remotePlayers = [];

	setEventHandlers();
};

var setEventHandlers = function() {

	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	window.addEventListener("resize", onResize, false);

	socket.on("connect", onSocketConnected);

	socket.on("disconnect", onSocketDisconnect);

	socket.on("new player", onNewPlayer);

	socket.on("move player", onMovePlayer);

	socket.on("remove player", onRemovePlayer);
};

function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

function onResize(e) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

function onSocketConnected() {
	console.log("Connected to socket server");

	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

function onNewPlayer(data) {
	console.log("New player connected: "+data.id);

	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = data.id;

	remotePlayers.push(newPlayer);
};

function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
};

function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};


function animate() {
	update();
	draw();

	window.requestAnimFrame(animate);
};



function update() {
	if (localPlayer.update(keys)) {

		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
	};
};


function draw() {

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	localPlayer.draw(ctx);

	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx);
	};
};


function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};

	return false;
};
