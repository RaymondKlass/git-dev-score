'use strict';

var mongoose = require('mongoose'),
  GitDev = mongoose.model('GitDev'),
  /*request = require('request'),*/
  /*async = require('async'),*/
  GitApiConfig = require('../config/git_api'),
  GitHubApi = require('github');


exports.ajax_test = function(req, res) {
  
  var json_response = {'status': 'success', 'msg': 'A json object just for you!'};
  
  res.json(json_response);
  
};


exports.git_developer_lookup = function(req, res) {

  var gitdev = new GitDev(req.body),
    developer = gitdev.username,
    user = {};
  
  var github = new GitHubApi({
    version: '3.0.0',
    headers: {
      'user-agent': GitApiConfig.user_agent
    }
  });
  
  github.authenticate({
    type: 'oauth',
    key: GitApiConfig.client_id,
    secret: GitApiConfig.client_secret
  });
  
  github.user.getFrom({user:developer}, 
    function(err, api_res) {
      if (err) {
        console.log(err);
      } else {
        user = api_res;
        // remove the headers from the github response obj - no reasons to save them
        delete user.meta;
        gitdev.user = user;
        
        gitdev.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log('success');
            console.log(gitdev);
          }
        });
      }
    }
  );
  // This won't work since the network call is async
  console.log(user);
  
  /*
  // Should probably upsert here instead...
  gitdev.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot create Git Developer'
      });
    }
    res.json(gitdev);
  }); */
};