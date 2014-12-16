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
            
            beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
                scope = $rootScope.$new();
                
                gitstatsController = $controller('GitstatsController', {
                    $scope: scope
                });
                
                $stateParams = _$stateParams_;
                $httpBackend = _$httpBackend_;
                $location = _$location_;
            }));
            
            it('$scope.getMessage should return a message', function() {
            
                // test expected GET request
                $httpBackend.expectGET('gitstats/test_ajax').respond({
                    status: 'success', 
                    msg: 'A json object just for you!'
                });
                
                // run controller
                scope.getMessage();
                $httpBackend.flush();
                
                expect(scope.message).toEqualData(
                    'A json object just for you!'
                );
            });
            
        });
    
    });

}());