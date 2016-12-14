// require mongoose
var mongoose = require('mongoose');
// require bcrypt
var bcrypt = require('bcryptjs'),
    SALT_WORK_FACTOR = 10;

// Create user schema
var userSchema = mongoose.Schema({
    FirstName: {
	    type:String,
	    required:true
  	},
    LastName: {
	    type:String,
	    required:true
  	},
    Email: {
	    type:String,
	    unique: true,
	    trim: true,
	    required:true,
	    match: [/.+\@.+\..+/, "Please enter a valid e-mail address"]
  	},
    Username: {
    	type: String,
    	unique: true,
    	trim: true,
    	required: true
    },
    Password: {
    	type: String,
    	unique: true,
    	trim: true,
    	required: true,
    	validate: [
			function(input) {
				return input.length >= 6;
			},
			'Password should be longer.'
		]
    },
    userCreated: {
		type: Date,
		default: Date.now
	}
});

userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    //compare plain text password with hashing password in database
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(undefined, isMatch);
    });
};

// Create the user model with the userSchema
var User = mongoose.model('User', userSchema);

// export the model
module.exports = User;