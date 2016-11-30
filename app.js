//require express module
var express = require ('express'),
	app = express(),
//create a HTTP server
	server = require ('http').createServer(app),
	io = require('socket.io').listen(server);
//listen to port 3000
server.listen(3000);

//create a route, set it root directory
app.get('/', function (req,res){
	res.sendFile(__dirname + '/public/index.html');
});

//receive message from browser; load codes for socket
io.sockets.on('connection', function(socket){
	//same name as send message 
	socket.on('send message', function(data){
		//send message to all users include me
		io.sockets.emit('new message', data);
	});
});