
var util = require("util"),					//utilities
	io = require("socket.io"),				// SOCKET
	Player = require("./Player").Player;

var socket,		//Oggetto principale per la connessione
	players;	// Array dei giocatori connessi

function init() {
  //Inizio con un vettore vuoto di giocatori
	players = [];

	// Set up Socket.IO to listen on port 8000
	socket = io.listen(8080);

	socket.configure(function() {
		//websockets -- devo ancora capire bene
		socket.set("transports", ["websocket"]);
		socket.set("log level", 2); //non serve a gran che solo per il livello del log
	});

	//"Listener"
	listenerToEvents();
};

var listenerToEvents = function() {
	// aspetta i giocatori
	socket.sockets.on("connection", sockConnection);
};

//gestione connesione
function sockConnection(client) {
	// util.log("New player has connected: "+client.id); //log
	client.on("disconnect", onClientDisconnect); //disconnesione
	client.on("new player", onNewPlayer); //connesione del nuovo player
	client.on("move player", onMovePlayer); // muove
};

function onClientDisconnect() {
	// util.log("Player has disconnected: "+this.id);
	var removePlayer = playerById(this.id);
	//evito errori per problemi di missname
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	//pulisco array
	players.splice(players.indexOf(removePlayer), 1);

	//trasmetto al client la disconnessione
	this.broadcast.emit("remove player", {id: this.id});
};

// Connessione di un nuovo giocatore
function onNewPlayer(data) {
	//instanzio nuovo player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = this.id;

	// trasmetto al client il login del nuovo player
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

	// trasmetto i player esistenti al client connesso
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
	};

	//aggiorno l'array
	players.push(newPlayer);
};

//movimento del player
function onMovePlayer(data) {
	//cerco il player con l'id
	var movePlayer = playerById(this.id);

	//evitiamo errori
	if (!movePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	//posizione del giocatore
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

	//trasmetto la posizione nuova
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
};

function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};

	return false;
};


init();
