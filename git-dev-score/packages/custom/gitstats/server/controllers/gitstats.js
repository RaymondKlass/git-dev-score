'use strict';

var mongoose = require('mongoose'),
  GitDev = mongoose.model('GitDev'),
  request = require('request'),
  /*async = require('async'),*/
  gitapi = require('../config/git_api');


exports.ajax_test = function(req, res) {
  
  var json_response = {'status': 'success', 'msg': 'A json object just for you!'};
  
  res.json(json_response);
  
};


exports.git_developer_lookup = function(req, res) {

  var gitdev = new GitDev(req.body),
    developer = gitdev.username;
    
  console.log(developer);
  
  console.log(gitapi.git_base_url);
  
  var query_string = {
    client_id: gitapi.client_id,
    client_secret: gitapi.client_secret
  };
  
  request({url:gitapi.git_base_url + '/users/' + developer, qs:query_string, headers:{'User-Agent':gitapi.user_agent}}, function(err, response, body) {
    if (err) {
      console.log(err);
    } else {
      console.log(response.headers);
      console.log(body);
    }

    res.json({status: 'Good'});
  
  });
  
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