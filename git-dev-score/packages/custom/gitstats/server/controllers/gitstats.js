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
          callback(null, null);
          /*res.json(gitDeveloper);
          return; */
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
                    console.log(api_res.meta.status);
                    if (api_res.meta.hasOwnProperty('status') && api_res.meta.status === '202 Accepted') {
                      console.log('RETURN 202');
                      var intervals = [1,2,4,10,20,50],
                        timers = [],
                        kill_all_timers = function() {
                          timers.forEach(function (element, index, array) {
                            clearTimeout(element);
                          });
                        };
                        
                      intervals.forEach(function(intervalElement, index, array) {
                        console.log(intervalElement)
                        timers.push(setTimeout(
                          function() {
                            git_wrapper.authenticate_app();
                            git_wrapper.github.repos.getStatsContributors({user:developer, repo:element.name}, function(err, api_res) {
                              console.log('re-run');
                              console.log(element.name);
                              console.log(api_res.meta);
                              if (!api_res.meta.hasOwnProperty('status') || api_res.meta.status !== '202 Accepted') {
                                kill_all_timers();

                                callback(err, {name: element.id, data : api_res});
                              }
                            });
                          }
                          ), 10000);
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
            
            var repo_translate = [],
                stats_obj = {};

            if ( results.length && results[0] ) {
                results[1].forEach(function(element, index, array) {
                    stats_obj[element.name] = element.data;
                });
                
                if (user_repos) {
                    user_repos.forEach(function(element, index, array) {
                        repo_translate.push({repo: element, stats: stats_obj[element.id]});
                    });
                }
    
                repos_callback(null, repo_translate);
            } else {
                repos_callback(null, null);
            }
          });
        }
      },
      function(err, results) {
        if (results.user) {
            gitdev.user = results.user;
            gitdev.user.login_lower = results.user.login.toLowerCase();
            gitdev.repos = results.repos;
            
            if ( gitdev.repos.length && gitdev.repos ) {
                var repo_stats = gitdev.aggregateRepoOwner();
                gitdev.repos.forEach(function(repo, index, array) {
                    repo.statsAgg = repo_stats[repo.repo.id];
                });
            }
            
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