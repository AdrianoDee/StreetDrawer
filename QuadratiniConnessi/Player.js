//Player class

var Player = function(startX, startY) {
	var x = startX,
		y = startY,
		id;

	//get
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	//accessibili
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		id: id    //per il multiplayer
	}
};

// esportazione per l'utilizzo in altri file (game.js)
exports.Player = Player;
