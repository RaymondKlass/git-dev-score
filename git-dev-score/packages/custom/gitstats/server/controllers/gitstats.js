'use strict';

var mongoose = require('mongoose'),
  GitDev = mongoose.model('GitDev'),
  async = require('async'),
  GitApiConfig = require('../config/git_api');


exports.ajax_test = function(req, res) {
  
  var json_response = {'status': 'success', 'msg': 'A json object just for you!'};
  
  res.json(json_response);
  
};


exports.git_developer_lookup = function(req, res) {

  var developer = req.body.username,
    gitdev = new GitDev({}),
    git_wrapper = GitApiConfig.git_api_wrapper;
  
  async.parallel([
    function(callback) {
      git_wrapper.authenticate_app();
      
      git_wrapper.github.user.getFrom({user:developer}, 
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
    },
    function(callback) {
      git_wrapper.authenticate_app();
      
      git_wrapper.github.repos.getFromUser({user:developer},
        function(err, api_res) {
          var repos;
          if (!err) {
            repos = api_res;
          }
          callback(err, repos);
        }
      );
    }
    
  ],
  function(err, results) {
  
    gitdev.user = results[0];
    
    gitdev.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: 'Cannot Save Developer'
        });
      }
      console.log('Saved No Problem'); 
      res.json(gitdev);
    });
    
  });

};