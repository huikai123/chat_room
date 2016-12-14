// var bcrypt = require('bcryptjs');
var	express = require('express');
var	router = express.Router();
var	User = require('../models/User.js');
var Chat = require('../models/Chat.js');

//chat page
router.get('/chat', function (req, res){
	//res.sendFile(__dirname + '../public/index.html');
	res.json(data);
});


//login_controller.js file
router.get('/signup', function(req,res) {
	//display register page
	// res.render('/signup');
	res.json(data);
});

router.get('/login', function(req,res) {
	//display login page
	// res.render('/login');
	res.json(data);
});

router.get('/logout', function(req,res) {
  req.session.destroy(function(err) {
    //after logout, redirect to home page
    res.redirect('/');
  })
});

//log in page
router.post('/login', function(req, res){
	// res.sendFile(__dirname + '../public/login.html');
	//store login info to database
	var username = req.body.username;
	var password = req.body.password;
	//find the username in database
	User.findOne({username: username}, function(err,user){
		if (err) throw err;
		//if user does not exist
		if (!user){
			console.log("Please register first!");
			//stay in login page
			return false;
		}

		user.comparePassword(password, function(err,isMatch){
			//if password result is match
			if (isMatch && isMatch ==true) {
				//set user to session
				req.session.user = user;
				return true;
			} else{
				return false;
			}
		});
	})
});

//sign up page
router.post('/signup', function(req,res){
	// res.sendFile(__dirname + '../public/signup.html');
	//declare varialbes to hold user info
	var firstname = req.body.firstname,
		lastname = req.body.lastname,
		email = req.body.email,
		username = req.body.username,
		password = req.body.password;

	//create a new user record
	var newUser = new User();
	newUser.firstname = firstname;
	newUser.lastname = lastname;
	newUser.email = email;
	newUser.username = username;
	newUser.password = password;
	
	//save the new user record into database
	newUser.save(function(err,savedUser){
		if (err){
			console.log(err);
		} else {
			console.log("sucessfully saved: " + newUser);
			res.redirect('login');
		}
	})	
});

module.exports = router;