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
          gitDeveloper.aggregateRepoOwner();
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
          var user_repos = [],
              repos_callback = callback;
          async.series([
            function(callback) {
              git_wrapper.authenticate_app();
              git_wrapper.github.repos.getFromUser({user:developer}, 
                function(err, api_res) { 
                  user_repos = api_res;
                  callback(err, api_res); 
              });
            },
            function(callback) {
              var user_repo_func = [];
              user_repos.forEach(function(element, index, array) {
                user_repo_func.push(function(callback) {
                  git_wrapper.authenticate_app();
                  git_wrapper.github.repos.getStatsContributors({user:developer, repo:element.name}, function(err, api_res) {
                    if (api_res.meta.status === 202) {
                      var intervals = [1,2,4],
                        timers = [],
                        kill_all_timers = function() {
                          timers.forEach(function (element, index, array) {
                            clearTimeout(element);
                          });
                        };
                        
                      intervals.forEach(function(element, index, array) {
                        timers.push(setTimeout(
                          function() {
                            git_wrapper.authenticate_app();
                            git_wrapper.github.repos.getStatsContributors({user:developer, repo:element.name}, function(err, api_res) {
                              if (api_res.meta.status !== 202) {
                                kill_all_timers();
                                
                                callback(err, {name: element.id, data : api_res});
                              }
                            });
                          }
                          ), element * 1000);
                      });
                    } else {
                      callback(err, {name: element.id, data : api_res});
                    }
                  });  
                });
              });

              async.parallel(user_repo_func, function(err, results) {
                if (err) {
                  console.log('Error');
                  console.log(err);
                }
                callback(null, results);
              });
            }
          ], function(err, results) {
            
            var repo_translate = [];
            if (user_repos) {
                user_repos.forEach(function(element, index, array) {
                    repo_translate.push({repo: element});
                });
            }

            repos_callback(null, repo_translate);
          });
        }
      },
      function(err, results) {
        if (results.user) {
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
        } else {
            // Don't insert blank people - if we didn't reach by error - the user most likely doesn't exist
            res.json({'status':'user not found'});
        }
        
      });
      callback(null, null);
    }
  ]);
};