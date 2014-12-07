'use strict';

angular.module('mean.gitstats').controller('GitstatsController', ['$scope', 'Global', 'Gitstats',
  function($scope, Global, Gitstats) {
    $scope.global = Global;
    $scope.package = {
      name: 'gitstats'
    };
  }
]);
