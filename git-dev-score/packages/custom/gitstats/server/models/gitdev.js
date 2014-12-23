'use strict';

// Dependenices
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;



var userObj = {
  login: String,
  id: Number,
  avatar_url: String,
  gravatar_id: String,
  url: String,
  html_url: String,
  followers_url: String,
  following_url: String,
  gists_url: String,
  starred_url: String,
  subscriptions_url: String,
  organizations_url: String,
  repos_url: String,
  events_url: String,
  received_events_url: String,
  type: { type:String},
  site_admin: String,
  name: String,
  company: String,
  blog: String,
  location: String,
  email: String,
  hireable: Boolean,
  bio: String,
  public_repos: Number,
  public_gists: Number,
  followers: Number,
  following: Number,
  created_at: String,
  updated_at: String
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