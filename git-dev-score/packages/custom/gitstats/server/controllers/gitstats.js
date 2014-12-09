'use strict';

exports.ajax_test = function(req, res) {
  
  var json_response = {'status': 'success', 'msg': 'A json object just for you!'};
  
  res.json(json_response);
  
};