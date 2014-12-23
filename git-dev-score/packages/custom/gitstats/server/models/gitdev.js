'use strict';

// Dependenices
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var userObj = {
  login: {
    type: String,
    required: true,
    trim: true
  },
  id: {
    type: Number,
    required: true
  }
};

  
// GitDev Schema
var GitDevSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  user: userObj
});


// Validations
GitDevSchema.path('username').validate(function(username) {
  return !!username;
}, 'Username cannot be blank');


// Assign model
mongoose.model('GitDev', GitDevSchema);