'use strict';

// The Package is past automatically as first parameter
module.exports = function(Gitstats, app, auth, database) {

  app.get('/gitstats/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/gitstats/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/gitstats/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/gitstats/example/render', function(req, res, next) {
    Gitstats.render('index', {
      package: 'gitstats'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
