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
    var finished_callback = callback;
    // We need to change this to also access Language stats...
    async.series([
      function(callback) {
        self.git_wrapper.authenticate_app();
        self.git_wrapper.github.repos.getFromUser({user:developer}, function(err, api_res) { callback(err, api_res); });
      }],
      function(err, results) {
        if (!err && results.length) {
          var repos = results[0],
              language_func = [];
          repos.forEach(function(repo, index, repos_array) {
            language_func.push( function(callback) {
              self.git_wrapper.authenticate_app();
              self.git_wrapper.github.repos.getLanguages({user:developer, repo:repo.name}, 
                function(err, api_res) { 
                  if (!err) {
                    delete api_res.meta;
                    repos[index].languages = api_res;
                  }
                  callback(err, api_res);
                }
              );
            });
          });
          
          async.parallel(language_func,
          function(err, results) {
            finished_callback(err, repos);
          });
        } else {
          finished_callback(err, []);
        }
      }
    );
  };
};

GitQuery.prototype.get_user_events = function(developer, max_pages, include_recent_code) {
  var self = this;
  if (!max_pages) {
    max_pages = 10;
  }
  
  return function(callback) {
    var parallelFunc = [];
    for (var i = 1; i <= max_pages; i+=1) {
      (function(iCopy) {
        parallelFunc.push( function(callback) {
          self.git_wrapper.authenticate_app();
          self.git_wrapper.github.events.getFromUser({user:developer, page:iCopy}, function(err, api_res) { callback(err, api_res); });
        });
      }(i));
    }
    
    async.parallel(parallelFunc, function(err, result) {
      var api_concat = [];
      if (!err) {
        // We should concatenate
        result.forEach(function(event_result, index, results_array) {
          api_concat = api_concat.concat(event_result);
        });
        
        // Here we could put code to also grab recent code contrib - if option set
        if (include_recent_code) {
            
            // Let's gather a list of the recent push events
            var commits = [];
            api_concat.forEach(function(event, index, event_array) {
              if ( event.type === 'PushEvent' ) {
                var commitGroup = [],
                    repo = null,
                    repoOwner = null;
                
                repo = event.repo.name.split('/');
                repoOwner = repo[0];
                repo = repo[repo.length -1];
                
                
                event.payload.commits.forEach(function(commit, index, commits_array) {
                  commitGroup.push({repo: repo, sha: commit.sha, repoOwner: repoOwner});
                });
                if ( commitGroup.length ) {
                  commits.push(commitGroup);
                }
              }
            });
            
            // Now we would need to go through and grab the commits...
            commits = commits.slice(0, 5); // only grab the 5 most recent (though this could change later...)
            var commitFunc = [];
            
            commits.forEach(function(commitGroup, index, commit_group_array) {
              commitGroup.forEach(function(commit, commitIndex, commit_array ) {
                commitFunc.push( function(callback) {
                  self.git_wrapper.authenticate_app();
                  self.git_wrapper.github.repos.getCommit({user: commit.repoOwner, repo: commit.repo, sha: commit.sha}, 
                                                            function(err, api_res) {callback(err, api_res); });
                });
              });
            });
            if ( commitFunc.length ) {
              async.parallel(commitFunc, function(err, result) {
                if ( err ) {
                  callback(err, null);
                } else {
                  var commit_concat = [];
                  result.forEach(function(commit, index, commits_array) {
                    commit_concat = commit_concat.concat(commit);
                  });
                  callback(err, {repos: api_concat, commits: commit_concat});
                }
              });
            }
             
        }
        
        callback(err, {repos: api_concat});
      } else {
        // return the error
        callback(err, null);
      }
    });
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
        events: git_wrap.get_user_events(developer, 10, true),
      }, function(err, results) {
        
        if (results.user) {
            gitdev.user = results.user;
            gitdev.user.login_lower = results.user.login.toLowerCase();
            gitdev.repos = results.repos.repos;
            gitdev.commits = results.repos.commits;
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