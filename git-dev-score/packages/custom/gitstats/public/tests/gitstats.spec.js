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
            
            it('$scope.getDev should post a message if developer is present', function() {
            
                // fixture - expected Post Data
                var postDeveloperData = function() {
                    return {
                        username:'Test-User'
                    };
                };
                
                // fixture - expected response data
                var responseDeveloperData = function() {
                    return {
                        username: 'Test-User',
                        repos: 5
                    };
                };
                
                // mock input values
                scope.git_dev_username = 'Test-User';
                
                // Test post request is sent
                $httpBackend.expectPOST('gitstats/git_developer', postDeveloperData()).respond(responseDeveloperData());
                
                // Run controller
                scope.getDev(true);
                $httpBackend.flush();
                
            });
            
        });
    
    });

}());