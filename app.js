/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

var express = require('express');
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
var server = require('http').createServer(app);
var io = (require('socket.io'))(server);

E = 3;
R = 0;
B = 1;

nextId = 0
games = [];

io.sockets.on('connection', function (socket) {
	console.log('Connected');

    socket.emit('con', 0);

    socket.on('createGame', function (data) {
    	console.log('Game Created');
    	var id = nextId;
    	nextId++;
    	games[id] = {};
    	games[id].board = [
				[R, B, R, B, R],
				[E, E, E, E, E],
				[R, E, E, E, B],
				[E, E, E, E, E],
				[B, R, B, R, B]
			];
		games[id].win = E;
		games[id].turn = R;

		games[id].red = this.id;
		games[id].redName = data.name;

		this.join(id);
		this.emit('newGame', id);
		io.to(id).emit('update', {board: games[id].board, turn: games[id].turn, win: games[id].win, redName: games[id].redName});
    });

    socket.on('joinGame', function (data) {
    	console.log('Game Joined');

    	if (!games[data.game]) {
    		return;
    	}

    	this.join(data.game);

    	if (games[data.game].black) {
    		io.to(data.game).emit('update', {board: games[data.game].board, turn: games[data.game].turn, win: games[data.game].win, redName: games[data.game].redName, blackName: games[data.game].blackName});
    		return;
    	}

		games[data.game].black = this.id;
		games[data.game].blackName = data.name;
		
		io.to(data.game).emit('update', {board: games[data.game].board, turn: games[data.game].turn, win: games[data.game].win, redName: games[data.game].redName, blackName: games[data.game].blackName});
    });

	socket.on('restart', function (data) {
    	console.log('Restart');

		games[data.game].board = [
				[R, B, R, B, R],
				[E, E, E, E, E],
				[R, E, E, E, B],
				[E, E, E, E, E],
				[B, R, B, R, B]
			];
		games[data.game].win = E;
		games[data.game].turn = R;

		io.to(data.game).emit('restart');
		io.to(data.game).emit('update', {board: games[data.game].board, turn: games[data.game].turn, win: games[data.game].win, redName: games[data.game].redName, blackName: games[data.game].blackName});
	});

	socket.on('move', function (data) {
    	console.log('Move');

    	if (this.id != (games[data.game].turn == R ? games[data.game].red : games[data.game].black)) {
    		console.log('Invalid Player');
    		io.to(data.game).emit('update', {board: games[data.game].board, turn: games[data.game].turn, win: games[data.game].win, redName: games[data.game].redName, blackName: games[data.game].blackName});
    		return;
    	}

    	var board = games[data.game].board;

    	var row = data.row;
    	var col = data.col;
    	var oldRow = data.oldRow;
    	var oldCol = data.oldCol;

    	if (board[oldRow][oldCol] != games[data.game].turn) {
    		console.log('Invalid Piece');
    		io.to(data.game).emit('update', {board: games[data.game].board, turn: games[data.game].turn, win: games[data.game].win, redName: games[data.game].redName, blackName: games[data.game].blackName});
    		return;
    	}

    	var check = false;

    	for (var i = 1; !check && (oldRow + i) < 5 && (oldCol + i) < 5 && board[oldRow + i][oldCol + i] == E; i++) {
			check = oldRow + i == row && oldCol + i == col;
		}

		for (var i = 1; !check && (oldRow + i) < 5 && board[oldRow + i][oldCol] == E; i++) {
			check = oldRow + i == row && oldCol == col;
		}

		for (var i = 1; !check && (oldRow + i) < 5 && (oldCol - i) >= 0 && board[oldRow + i][oldCol - i] == E; i++) {
			check = oldRow + i == row && oldCol - i == col;
		}

		for (var i = 1; !check && (oldCol + i) < 5 && board[oldRow][oldCol + i] == E; i++) {
			check = oldRow == row && oldCol + i == col;
		}

		for (var i = 1; !check && (oldCol - i) >= 0 && board[oldRow][oldCol - i] == E; i++) {
			check = oldRow == row && oldCol - i == col;
		}

		for (var i = 1; !check && (oldRow - i) >=0 && (oldCol + i) < 5 && board[oldRow - i][oldCol + i] == E; i++) {
			check = oldRow - i == row && oldCol + i == col;
		}

		for (var i = 1; !check && (oldRow - i) >= 0 && board[oldRow - i][oldCol] == E; i++) {
			check = oldRow - i == row && oldCol == col;
		}

		for (var i = 1; !check && (oldRow - i) >= 0 && (oldCol - i) >= 0 && board[oldRow - i][oldCol - i] == E; i++) {
			check = oldRow - i == row && oldCol - i == col;
		}

		if (!check) {
    		console.log('Invalid Move');
    		io.to(data.game).emit('update', {board: games[data.game].board, turn: games[data.game].turn, win: games[data.game].win, redName: games[data.game].redName, blackName: games[data.game].blackName});
    		return;
    	}

    	board[row][col] = board[oldRow][oldCol];
		board[oldRow][oldCol] = E;

    	var color = board[data.row][data.col];
		var score = [1, 1, 1, 1];

		for (var i = 1; (row + i) < 5 && (col + i) < 5 && board[row + i][col + i] == color; i++) {
			score[0]++;
		}

		for (var i = 1; (row + i) < 5 && board[row + i][col] == color; i++) {
			score[1]++;
		}

		for (var i = 1; (row + i) < 5 && (col - i) >= 0 && board[row + i][col - i] == color; i++) {
			score[2]++;
		}

		for (var i = 1; (col + i) < 5 &&  board[row][col + i] == color; i++) {
			score[3]++;
		}

		for (var i = 1; (col - i) >= 0 && board[row][col - i] == color; i++) {
			score[3]++;
		}

		for (var i = 1; (row - i) >= 0 && (col + i) < 5 && board[row - i][col + i] == color; i++) {
			score[2]++;
		}

		for (var i = 1; (row - i) >= 0 && board[row - i][col] == color; i++) {
			score[1]++;
		}

		for (var i = 1; (row - i) >= 0 && (col - i) >= 0 && board[row - i][col - i] == color; i++) {
			score[0]++;
		}

		if (score[0] > 3 || score[1] > 3 || score[2] > 3 || score[3] > 3) games[data.game].win = color;

		games[data.game].turn = games[data.game].turn == R ? B : R;

		io.to(data.game).emit('update', {board: games[data.game].board, turn: games[data.game].turn, win: games[data.game].win, redName: games[data.game].redName, blackName: games[data.game].blackName});
	});
});

server.listen(appEnv.port);