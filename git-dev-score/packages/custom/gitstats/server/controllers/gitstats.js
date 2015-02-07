'use strict';

var mongoose = require('mongoose'),
  GitDev = mongoose.model('GitDev'),
  async = require('async'),
  GitApiConfig = require('../config/git_api');


exports.ajax_test = function(req, res) {
  
  var json_response = {'status': 'success', 'msg': 'A json object just for you!'};
  
  res.json(json_response);
  
};



/*
 * Git Query Class
 *
 * Wraps Github API and handles authentication - returns API response or error
*/

var GitQuery = function(git_wrapper) {
  this.git_wrapper = git_wrapper;
};

GitQuery.prototype.get_user_info = function(git_user) {
  var self = this;
  return function(callback) {
    self.git_wrapper.authenticate_app();
    self.git_wrapper.github.user.getFrom({user:git_user}, function(err, api_res) { callback(err, api_res); });
  };
};

GitQuery.prototype.get_user_repos = function(developer) {
  var self = this;
  return function(callback) {
    self.git_wrapper.authenticate_app();
    self.git_wrapper.github.repos.getFromUser({user:developer}, function(err, api_res) { callback(err, api_res); });
  };
};

GitQuery.prototype.get_user_events = function(developer) {
  var self = this;
  return function(callback) {
    self.git_wrapper.authenticate_app();
    self.git_wrapper.github.events.getFromUser({user:developer}, function(err, api_res) { callback(err, api_res); });
  };
};






exports.git_developer_lookup = function(req, res) {
  var developer = req.body.username,
    gitdev = new GitDev({}),
    git_wrapper = GitApiConfig.git_api_wrapper,
    git_wrap = new GitQuery(git_wrapper);
  
  var now = new Date(),
    dateMinus1Day =  now.setDate(now.getDate()-1),
    query = GitDev.where({'user.login_lower' : developer.toLowerCase()})
                  .where('updated_at')
                  .gte(dateMinus1Day);

  
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
        user: git_wrap.get_user_info(developer),
        repos: git_wrap.get_user_repos(developer),
        events: git_wrap.get_user_events(developer),
      }, function(err, results) {
        
        if (results.user) {
            gitdev.user = results.user;
            gitdev.user.login_lower = results.user.login.toLowerCase();
            gitdev.repos = results.repos;
            gitdev.events = results.events;
            
            var gitdev_obj = gitdev.toObject();
            delete gitdev_obj._id;
            
            GitDev.findOneAndUpdate({'user.id': gitdev.user.id}, gitdev_obj, {upsert:true}, function(err, row) {
              if (err) {
                console.log(err);
              } else {
                res.json(row);
              }
            });
        } else {
            // Don't insert blank people - if we didn't reach by error - the user most likely doesn't exist
            res.json({'status':'user not found'});
        }
        
      });
      callback(null, null);
    }
  ]);
};