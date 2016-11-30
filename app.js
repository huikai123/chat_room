//require express module
var express = require ('express'),
	app = express(),
//create a HTTP server
	server = require ('http').createServer(app),
	io = require('socket.io').listen(server),
//create array to hold nicknames
	nicknames = [];
//listen to port 3000
server.listen(3000);

//create a route, set it root directory
app.get('/', function (req,res){
	res.sendFile(__dirname + '/public/index.html');
});

//load codes for socket
io.sockets.on('connection', function(socket){
	//receive nicknames from client side
	socket.on('new user', function(data,callback){
		// check to see if nicknames exist or not
		if (nicknames.indexOf(data)!= -1){
			callback(false);
		} else {
			callback(true);
			//store nickname to socket
			socket.nickname = data;
			//add nickname in the array
			nicknames.push(socket.nickname);
			updateNicknames();
		}
	});

	//all users can see new nicknames
	function updateNicknames(){
		io.sockets.emit('usernames', nicknames);
	}
	
	//receive message from browser
	socket.on('send message', function(data){
		//send message to all users include me, with username
		io.sockets.emit('new message', {msg: data, nick: socket.nickname});
	});

	//disconnect from server
	socket.on('disconnect', function(data){
		//if no username entered, return
		if(!socket.nickname) return;
		//remove nickname from array
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
	});
});