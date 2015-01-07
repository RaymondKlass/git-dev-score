'use strict';

// Module dependencies
var should = require('should'),
    mongoose = require('mongoose'),
    GitDev = mongoose.model('GitDev'),
    nock = require('nock'),
    gitstats_controller = require('../controllers/gitstats.js'),
    git_user = {
        'id': 1234,
        'login': 'My_Login'
    },
    git_repos = [
        {'id': 123,
         'name': 'my_first_repo'
        },{
         'id': 124,
         'name': 'my_second_repo'
        }
    ];

// Globals
var gitdev,
    git_user_mock = nock('https://api.github.com');
                        
                        
git_user_mock.filteringPath(function(path) {
                return path.split('?')[0];
            })
            .log(console.log)
            .persist()
            .get('/users/my_login')
            .reply(200, git_user)
            .get('/users/my_login/repos')
            .reply(200, git_repos);
                        

describe('<Controller Test>', function() {
    describe('Git Developer Lookup', function() {
        it('Should be able to save a developer', function(done) {
            gitstats_controller.git_developer_lookup({body: {username: 'my_login'}},
                {
                    json: function(data) {
                        // Test User creation
                        data.user.id.should.equal(1234);
                        data.user.login.should.equal('My_Login');
                        data.user.login_lower.should.equal('my_login');
                        // Test Repos portion
                        data.repos[0].id.should.equal(123);
                        data.repos[1].id.should.equal(124);
                        done();
                    }
            });
        });
    });
    afterEach( function(done) {
        var query = GitDev.where({'user.id' : 1234});
        query.findOne( function(err, gitDeveloper) {
            if (!err) {
                gitDeveloper.remove();
            } else {
                console.log(err);
            }
            done();
        });
    });
}); 


// Test Suites
describe('<Unit Test>', function() {
    describe('Model GitDev', function() {
        beforeEach(function(done) {
            
            gitdev = new GitDev({
                user: git_user,
                repos: git_repos
            });
            
            done();
        });
        
        describe('Method Save', function() {
            it('Should be able to save new Git Developer', function(done) {
                console.log(gitdev);
                return gitdev.save(function(err) {
                    should.not.exist(err);
                    gitdev.user.id.should.equal(1234);
                    gitdev.updated_at.should.not.have.length(0);
                    done();
                });
            });
            
            it('Should not allow duplicate users to exist - throws error', function(done) {
                return gitdev.save(function(err) {
                    var gitdev2 = new GitDev({
                        user: git_user,
                        repos: git_repos
                    });
                    
                    gitdev2.save(function(err) {
                        should.exist(err);
                        err.code.should.equal(11000);
                        done();
                    });      
                });
            });
        
        });
        
        afterEach( function(done) {
            gitdev.remove();
            done();
        });
        
    });
});