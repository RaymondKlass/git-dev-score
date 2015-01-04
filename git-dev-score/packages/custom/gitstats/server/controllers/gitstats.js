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
  
  var now = new Date(),
    dateMinus1Day =  now.setDate(now.getDate()-1),
    query = GitDev.where({'user.login_lower' : developer.toLowerCase()}).where('updated_at').gte(dateMinus1Day);

  
  async.series([
    function(callback) {
      query.findOne( function(err, gitDeveloper) {
        if (err) {
          console.log(err);
          res.json({'Status' : 'Error'});
        } else if (gitDeveloper) {
          res.json(gitDeveloper);
          return;
        } else {
          callback(null, null);
        }
      });
    },
    function(callback) {
      async.parallel({
        user: function(callback) {
          git_wrapper.authenticate_app();
          git_wrapper.github.user.getFrom({user:developer}, function(err, api_res) { callback(err, api_res); });
        },
        repos: function(callback) {
          git_wrapper.authenticate_app();
          git_wrapper.github.repos.getFromUser({user:developer}, function(err, api_res) { callback(err, api_res); });
        }
      },
      function(err, results) {
        gitdev.user = results.user;
        gitdev.user.login_lower = results.user.login.toLowerCase();
        gitdev.repos = results.repos;
    
        var gitdev_obj = gitdev.toObject();
        delete gitdev_obj._id;
        
        GitDev.findOneAndUpdate({'user.id': gitdev.user.id}, gitdev_obj, {upsert:true}, function(err, row) {
          if (err) {
            console.log(err);
          } else {
            res.json(row);
          }
        });
        
      });
      callback(null, null);
    }
  ]);
};