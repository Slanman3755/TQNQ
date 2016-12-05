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


io.sockets.on('connection', function (socket) {
	console.log('Connected');
	socket.on('newGame', function (data) {
    	console.log('New Game');
	});
});

server.listen(appEnv.port);