'use strict';

(function() {

    // Gitstats Spec
    describe('Angular Controllers', function() {
        describe('Gitstats Controllers', function() {
            // Add a custome matcher that ignores functions in comparisons (since AngularJS $resource add methods)
            beforeEach(function() {
                this.addMatchers({
                    toEqualData: function(expected) {
                        return angular.equals(this.actual, expected);
                    }
                });
            });
            
            beforeEach(function() {
                module('mean');
                module('mean.system');
                module('mean.gitstats');
            });
            
            // Initialize controller and mock scope
            var gitstatsController,
                scope,
                $httpBackend,
                $stateParams,
                $location;
            
            
            
        });
    
    });

}());