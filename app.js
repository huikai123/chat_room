//require express module
var express = require ('express'),
	app = express(),
//require mongoose for mongodb
	mongoose = require ('mongoose'),
//create a HTTP server
	server = require ('http').createServer(app),
	io = require('socket.io').listen(server),
//create object to hold users
	users = {};
//listen to port 3000
server.listen(3000);

//connect to mongodb
mongoose.connect('mongodb://localhost/chat', function(err){
	if (err){
		console.log("There is problem with Mongo connection" + err);
	} else {
		console.log("connected to mongodb!");
	}
});

//create a schema
var chatSchema = mongoose.Schema({
	nick: String,
	msg: String,
	created: {type: Date, default: Date.now}
});

//create a model
var Chat = mongoose.model('Message', chatSchema);

//create a route, set it root directory
app.get('/', function (req,res){
	res.sendFile(__dirname + '/public/index.html');
});

//load codes for socket
io.sockets.on('connection', function(socket){
	var query = Chat.find({}); 
	query.sort('-created').limit(20).exec(function(err,docs){
		if(err) throw err;
		socket.emit('load old msg', docs);
	});

	//receive nicknames from client side
	socket.on('new user', function(data,callback){
		// check to see if users exist or not
		if (data in users){
			callback(false);
		} else {
			callback(true);
			//store nickname to socket
			socket.nickname = data;
			//nickname as key and socket as value
			users[socket.nickname] = socket;
			updateNicknames();
		}
	});

	//all users can see new nicknames
	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
	}
	
	//receive message from browser
	socket.on('send message', function(data, callback){
		//trim spaces before and after
		var msg = data.trim();
		console.log('after trimming message is: ' + msg);
		// use "/w " to begin private message
		if (msg.substr(0,3) === "/w "){
			msg = msg.substr(3);
			//space after username
			var ind = msg.indexOf(' ');
			//if there is input in message box
			if(ind !== -1){
				//this part is user name
				var name = msg.substring(0, ind);
				//message starts here
				var msg = msg.substring(ind + 1);
				//if user name is in the list
				if (name in users){
					users [name].emit('whisper', {msg: msg, nick: socket.nickname});
					console.log('message sent is: ' + msg);
					console.log('Whisper!');
				} else {
					callback('Error! Enter a valid user.');
				}			
			} else{
				callback('Error! Please enter a valid message for your whisper.');
			}
		} else{
			var newMsg = new Chat({msg: msg, nick: socket.nickname});
			newMsg.save(function(err){
				if (err) throw err;
			//send message to all users include me, with username
			io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
			});
		}
	});

	//disconnect from server
	socket.on('disconnect', function(data){
		//if no username entered, return
		if(!socket.nickname) return;
		//remove nickname from object
		delete users [socket.nickname];
		updateNicknames();
	});
});