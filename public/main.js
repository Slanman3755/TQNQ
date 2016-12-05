E = 3;
R = 0;
B = 1;
D = 2;
board = [
		[R, B, R, B, R],
		[E, E, E, E, E],
		[R, E, E, E, B],
		[E, E, E, E, E],
		[B, R, B, R, B]
	];
turn = R;
win = E;
socket = null;
game = 0;
userColor = R;
userName = Math.random().toString(36).substring(7);

var select = function(cell) {
	$('.cell').removeClass('selected');
	$(cell).addClass('selected');

	var id = $(cell).prop('id');
	var row = parseInt(id.charAt(1)) - 1;
	var col = id.charCodeAt(0) - 97;

	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			if (board[i][j] == D) board[i][j] = E;
		}
	}

	for (var i = 1; (row + i) < 5 && (col + i) < 5 && board[row + i][col + i] == E; i++) {
		board[row + i][col + i] = D;
	}

	for (var i = 1; (row + i) < 5 && board[row + i][col] == E; i++) {
		board[row + i][col] = D;
	}

	for (var i = 1; (row + i) < 5 && (col - i) >= 0 && board[row + i][col - i] == E; i++) {
		board[row + i][col - i] = D;
	}

	for (var i = 1; (col + i) < 5 &&  board[row][col + i] == E; i++) {
		board[row][col + i] = D;
	}

	for (var i = 1; (col - i) >= 0 && board[row][col - i] == E; i++) {
		board[row][col - i] = D;
	}

	for (var i = 1; (row - i) >= 0 && (col + i) < 5 && board[row - i][col + i] == E; i++) {
		board[row - i][col + i] = D;
	}

	for (var i = 1; (row - i) >= 0 && board[row - i][col] == E; i++) {
		board[row - i][col] = D;
	}

	for (var i = 1; (row - i) >= 0 && (col - i) >= 0 && board[row - i][col - i] == E; i++) {
		board[row - i][col - i] = D;
	}

	drawBoard();
}

var update = function(game) {
	board = game.board;
	win = game.win;
	turn = game.turn;

	drawBoard();
}

var move = function(cell) {
	var id = $(cell).prop('id');
	var row = parseInt(id.charAt(1)) - 1;
	var col = id.charCodeAt(0) - 97;

	id = $('.selected').prop('id');
	var oldRow = parseInt(id.charAt(1)) - 1;
	var oldCol = id.charCodeAt(0) - 97;

	$('.cell').removeClass('selected');

	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			if (board[i][j] == D) board[i][j] = E;
		}
	}

	drawBoard();

	socket.emit('move', {row: row, col: col, oldRow: oldRow, oldCol: oldCol, game: game, color: userColor});
}

var drawBoard = function() {
	$('.queen').remove();
	$('.dot').remove();
    $('.usrName').text(userName);
	var dot = '<img class="dot">';
	var redQueen = '<img class="queen" id="red">';
	var blackQueen = '<img class="queen" id="black">';

	for (i = 0; i < 5; i++) {
		for (j = 0; j < 5; j++) {
			var image = null;
			switch(board[i][j]) {
				case R:
					image = redQueen;
					break;
				case B:
					image = blackQueen;
					break;
				case D:
					image = dot;
					break;
			}
			if (image) $('.cell#' + String.fromCharCode(j + 97) + (i + 1)).append(image);
		}
	}

	$('.color').text(userColor ? "You are black" : "You are red");

	if (win != E) {
		$('.turn').text(win ? "Black Wins!" : "Red Wins!");
		$('.board').addClass('done');
	} else {
		$('.turn').text(turn ? "Black's Turn" : "Red's Turn");

		if (userColor == turn) {
			$('.queen#' + (turn ? 'black' : 'red')).click(function(e) {
				select(e.target.parentElement);
			});

			$('.dot').click(function(e) {
				move(e.target.parentElement);
			});
		}
	}
}

var restart = function() {
	$('.board').removeClass('done');
	$('.cell').removeClass('selected');
}

$('.restart').click(function() {
	socket.emit('restart', {game: game, color: userColor});
});

$('.color').click(function() {
	userColor = userColor == R ? B : R;
	socket.emit('restart', {game: game, color: userColor});
});

drawBoard();

socket = io.connect();

socket.on('con', function(data) {
    restart();
    socket.emit('restart', {game: game, color: userColor, usr: userName});
});

socket.on('update', function(data) {
	update(data);
});

socket.on('restart', function(data) {
	restart();
});