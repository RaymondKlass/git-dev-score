'use strict';

angular.module('mean.gitstats').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('gitstats example page', {
      url: '/gitstats/example',
      templateUrl: 'gitstats/views/index.html'
    });
  }
]);
