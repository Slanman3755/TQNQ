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

var move = function(cell) {
	var id = $(cell).prop('id');
	var row = parseInt(id.charAt(1)) - 1;
	var col = id.charCodeAt(0) - 97;

	id = $('.selected').prop('id');
	var oldRow = parseInt(id.charAt(1)) - 1;
	var oldCol = id.charCodeAt(0) - 97;

	board[row][col] = board[oldRow][oldCol];
	board[oldRow][oldCol] = E;

	$('.cell').removeClass('selected');

	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			if (board[i][j] == D) board[i][j] = E;
		}
	}

	var color = board[row][col];
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

	if (score[0] > 3 || score[1] > 3 || score[2] > 3 || score[3] > 3) win = color;

	turn = !turn;

	drawBoard();
}

var drawBoard = function() {
	$('.queen').remove();
	$('.dot').remove();

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

	if (win != E) {
		$('.turn').text(win ? "Black Wins!" : "Red Wins!");
		$('.board').addClass('done');
	} else {
		$('.turn').text(turn ? "Black's Turn" : "Red's Turn");

		$('.queen#' + (turn ? 'black' : 'red')).click(function(e) {
			select(e.target.parentElement);
		});

		$('.dot').click(function(e) {
			move(e.target.parentElement);
		});
	}
}

$('.restart').click(function() {
	board = [
		[R, B, R, B, R],
		[E, E, E, E, E],
		[R, E, E, E, B],
		[E, E, E, E, E],
		[B, R, B, R, B]
	];
	win = E;
	turn = R;
	$('.board').removeClass('done');
	$('.cell').removeClass('selected');
	drawBoard();
	socket.emit('newGame', 1);
});

drawBoard();

socket = io.connect();
socket.on('connected', function(data) {
	console.log('connected');
});

socket.on('newGame', function(data) {
	console.log('new game');
});

socket.emit('newGame', 1);