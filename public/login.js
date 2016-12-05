$('.join').click(function() {
	var name = $('.name').val();
	var id = $('.gameid').val();
	window.location.href = 'board.html?id=' + id + '&name=' + name;
});

$('.create').click(function() {
	var name = $('.name').val();
	window.location.href = 'board.html?name=' + name;
});