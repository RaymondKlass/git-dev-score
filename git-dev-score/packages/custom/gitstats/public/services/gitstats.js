'use strict';

angular.module('mean.gitstats').factory('Gitstats', [ '$resource',
  function($resource) {
    return $resource('gitstats/test_ajax', {});
      
  }
]);
