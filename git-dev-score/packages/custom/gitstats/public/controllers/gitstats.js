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
