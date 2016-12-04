E = 0;
R = 1;
B = 2;
D = 3;
var board = [
		[R, B, R, B, R],
		[E, E, E, E, E],
		[R, E, E, E, B],
		[E, E, E, E, E],
		[B, R, B, R, B]
	];

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
	var newRow = parseInt(id.charAt(1)) - 1;
	var newCol = id.charCodeAt(0) - 97;

	id = $('.selected').prop('id');
	var oldRow = parseInt(id.charAt(1)) - 1;
	var oldCol = id.charCodeAt(0) - 97;

	board[newRow][newCol] = board[oldRow][oldCol];
	board[oldRow][oldCol] = E;

	$('.cell').removeClass('selected');

	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 5; j++) {
			if (board[i][j] == D) board[i][j] = E;
		}
	}

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


	$('.queen').click(function(e) {
		select(e.target.parentElement);
	});

	$('.dot').click(function(e) {
		move(e.target.parentElement);
	});
}

drawBoard();