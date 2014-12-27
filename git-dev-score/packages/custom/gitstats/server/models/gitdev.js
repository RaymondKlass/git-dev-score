'use strict';

// Dependenices
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;



var userObj = {
  login:{
    type: String,
    index: {
      unique: true
    }
  },
  id: {
    type: Number,
    index: {
      unique: true
    }
  },
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
  created_at: Date,
  updated_at: Date
};

  
// GitDev Schema
var GitDevSchema = new Schema({
  user: userObj
});


// Validations
GitDevSchema.path('user.login').validate(function(user) {
  return !!user.login;
}, 'Username cannot be blank');


// Assign model
mongoose.model('GitDev', GitDevSchema);