'use strict';

var mongoose = require('mongoose'),
  GitDev = mongoose.model('GitDev'),
  /*request = require('request'),*/
  async = require('async'),
  GitApiConfig = require('../config/git_api'),
  GitHubApi = require('github');


exports.ajax_test = function(req, res) {
  
  var json_response = {'status': 'success', 'msg': 'A json object just for you!'};
  
  res.json(json_response);
  
};


exports.git_developer_lookup = function(req, res) {

  var developer = req.body.username,
    gitdev = new GitDev({});
  
  var github = new GitHubApi({
    version: '3.0.0',
    headers: {
      'user-agent': GitApiConfig.user_agent
    }
  });
  
  // Just authenticate against my app for now -
  // later we can add the ability for user to authenticate themselves
  // for private element access
  var authenticate_github = function () {
    github.authenticate({
      type: 'oauth',
      key: GitApiConfig.client_id,
      secret: GitApiConfig.client_secret
    });
  };
  
  async.series([
    function(callback) {
      
      authenticate_github();
      
      github.user.getFrom({user:developer}, 
        function(err, api_res) {
          var user;
          if (!err) {
            user = api_res;
            // remove the headers from the github response obj - no reasons to save them
            delete user.meta;
          }
          callback(err, user);
        }
      );
    }
  ],
  function(err, results) {
  
    gitdev.user = results[0];
    gitdev.save(function(err) {
      if (err) {
        return res.status(500).json({
          error: 'Cannot Save Developer'
        });
      } 
      res.json(gitdev);
    });
    
  });
  
  // gitdev = new GitDev(req.body)
  
  // This won't work since the network call is async
  //console.log(user);
  
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