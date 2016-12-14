//Dependencies
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var methodOverride = require('method-override');


// var passport = require('passport');
// var flash = require('connect-flash');

// require('./controllers/router.js')(app, passport);

// require('./config/passport')(passport);

//connect to mongodb
mongoose.connect('mongodb://localhost/chat', function(err){
	if (err){
		console.log("There is problem with Mongo connection" + err);
	} else {
		console.log("connected to mongodb!");
	}
});

// Model controllers
var routes = require('./controllers/router.js');
// var models = require('./models');
// Set /public as static so we can reference image and css files in that folder
app.use(express.static(process.cwd() + '/public'));
app.use('/login', routes);

// // Handlebars
// var exphbs = require('express-handlebars');
// app.engine('handlebars', exphbs({
//     defaultLayout: 'main'
// }));

// //view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'handlebars');

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'app',
				 saveUninitialized: true,
				 resave: true}));
app.use(express.static(path.join(__dirname,'public')));

// app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions
// app.use(flash()); // use connect-flash for flash messages stored in session

//React render routes for client side
// app.get('*', function(req, res){
// 	res.
// })

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Server running on port: ' + port);



