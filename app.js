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
	//select all documents in DB
	var query = Chat.find({}); 
	//sort by latest 20 messages
	query.sort('-created').limit(20).exec(function(err,docs){
		if(err) throw err;
		socket.emit('load old msg', docs);
	});

	//receive nicknames from client side
	socket.on('new user', function(data,callback){ 
		if (data in users){
			callback(false);
		//if users not exist
		} else {
			callback(true);
			//store data input as the nickname
			socket.nickname = data;
			// add the username to the global list (backend)
			users[socket.nickname] = socket;
			updateNicknames();
		}
	});

	
	// add the username to the list (frontend)
	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
		console.log("new user join:" + socket.nickname);
	}
	
	//receive message from browser
	socket.on('send message', function(data, callback){

		//trim spaces before and after
		var msg = data.trim();
		// use "@" to begin private message
		if (msg.substr(0,1) === "@"){
			msg = msg.substr(1);
			//get the position of the white space after username
			var ind = msg.indexOf(' ');
			//if message box is not empty
			if(ind !== -1){
				//this is user name
				var name = msg.substring(0, ind);
				//actual message starts here
				var msg = msg.substring(ind + 1);
				//if user name is in the list
				if (name in users){
					//send private message to selected user only
					users [name].emit('whisper', {msg: msg, nick: socket.nickname});
					//send private message to sender himself
					users [socket.nickname].emit('whisper', {msg: msg, nick: socket.nickname});

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
			//send message to all users including sender
			io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
			console.log("time:"+created);
			});
		}
	});

	//disconnect from server
	socket.on('disconnect', function(data){
		
		io.emit('updateChat', {nick: socket.nickname});
		console.log("user left:" + socket.nickname);
		//if no username entered, return
		if(!socket.nickname) return;
		//remove nickname from object
		delete users [socket.nickname];
		updateNicknames();
	});
});