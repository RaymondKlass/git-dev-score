'use strict';

var mongoose = require('mongoose'),
  GitDev = mongoose.model('GitDev');


exports.ajax_test = function(req, res) {
  
  var json_response = {'status': 'success', 'msg': 'A json object just for you!'};
  
  res.json(json_response);
  
};


exports.git_developer_lookup = function(req, res) {

  var gitdev = new GitDev(req.body);
  
  gitdev.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot create Git Developer'
      });
    }
    res.json(gitdev);
  });
};