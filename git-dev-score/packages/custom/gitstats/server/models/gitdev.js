'use strict';

// Dependenices
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  
// GitDev Schema

var GitDevSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  username: {
    type: String,
    required: true,
    trim: true
  }
});


// Validations
GitDevSchema.path('username').validate(function(username) {
  return !!username;
}, 'Username cannot be blank');


// Assign model
mongoose.model('GitDev', GitDevSchema);