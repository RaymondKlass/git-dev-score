'use strict';

angular.module('mean.gitstats').controller('GitstatsController', ['$scope', 'Global', 'Gitstats', 'GitDev',
  function($scope, Global, Gitstats, GitDev) {
    $scope.global = Global;
    $scope.package = {
      name: 'gitstats'
    };
    $scope.message = 'No Message Yet...';
    $scope.git_dev_username = null;
    $scope.git_data = null;
    $scope.date_now = new Date();
    $scope.d3Data = [
      {name: 'Greg', score: 98},
      {name: 'Ari', score: 96},
      {name: 'Q', score: 75},
      {name: 'Loser', score: 48}
    ];
    $scope.getMessage = function() {
      Gitstats.get(function(data) {
        $scope.message = data.msg;
      });
    };
    
    $scope.getDev = function(isValid) {
      if (isValid) {
        var git_developer = new GitDev({
          username: $scope.git_dev_username});
        
        git_developer.$save( function(response) {
          $scope.git_data = response;
        });
      }
    };
    
  }
]);
