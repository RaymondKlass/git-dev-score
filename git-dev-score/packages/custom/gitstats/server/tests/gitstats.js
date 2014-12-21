'use strict';

// Module dependencies
var should = require('should'),
    mongoose = require('mongoose'),
    GitDev = mongoose.model('GitDev');

// Globals
var gitdev;


// Test Suites
describe('<Unit Test>', function() {
    describe('Model GitDev', function() {
        beforeEach(function(done) {
            
            gitdev = new GitDev({
                username: 'Test Developer'
            });
            
            done();
        });
        
        describe('Method Save', function() {
            it('Should be able to save new Git Developer', function(done) {
                return gitdev.save(function(err) {
                    should.not.exist(err);
                    gitdev.username.should.equal('Test Developer');
                    gitdev.created.should.not.have.length(0);
                    done();
                });
            });
        
        });
        
        afterEach( function(done) {
            gitdev.remove();
            done();
        });
        
    });
});