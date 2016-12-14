// require mongoose
var mongoose = require('mongoose');


// Create chat schema
var chatSchema = mongoose.Schema({
    nick: String,
    msg: String,
    created: {
      type: Date,
      default: Date.now
    }
});

// Create the Chat model with the chatSchema
var Chat = mongoose.model('Chat', chatSchema);

// export the model
module.exports = Chat;