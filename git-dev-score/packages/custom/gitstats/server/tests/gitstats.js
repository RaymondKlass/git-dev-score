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
      },
      {'id': 124,
         'name': 'my_second_repo'
      }
    ],
    git_events = [
      {'id': 1234,
        'type': 'pushEvent',
        'payload': {'first': 1, 'second':2}
      }
    ],
    git_languages = {
      'Python': 123,
      'C': 35
    };

// Globals
var gitdev,
    git_user_mock;
                        

describe('<Controller Tests>', function() {
    describe('Git Developer Lookup', function() {
        
        beforeEach( function(done) {
            git_user_mock = nock('https://api.github.com');
            git_user_mock.filteringPath(function(path) {
                return path.split('?')[0];
            })
            .get('/users/my_login')
            .reply(200, git_user)
            .get('/users/my_login/repos')
            .reply(200, git_repos)
            .get('/users/my_login/events')
            .times(10)
            .reply(200, git_events)
            .get('/repos/my_login/my_first_repo/languages')
            .reply(200, git_languages)
            .get('/repos/my_login/my_second_repo/languages')
            .reply(200, git_languages);
            done();
        });
        
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
                        data.events[0].id.should.equal(1234);
                        data.events[0].payload.first.should.equal(1);
                        // Make sure that both mocks were actually used
                        git_user_mock.isDone().should.equal(true);

                        done();
                    }
            });
        });
        
        it('Saving a developer a second time within 24 hours should not trigger github api requests', function(done) {
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
                        
                        // Make sure that both mocks were actually used
                        git_user_mock.isDone().should.equal(true);
                        
                        // Setup a new mock
                        git_user_mock.filteringPath(function(path) {
                                return path.split('?')[0];
                            })
                            .get('/users/my_login')
                            .reply(200, git_user)
                            .get('/users/my_login/repos')
                            .reply(200, git_repos);
                        
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
                                    
                                    git_user_mock.isDone().should.equal(false);
                                    git_user_mock.pendingMocks().length.should.equal(2);
                                    done();
                                }
                        });
                    }
            });
        });
        
        it('Saving a developer outside of 24 hours should trigger github api requests and update developer', function(done) {
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
                        
                        // Make sure that both mocks were actually used
                        git_user_mock.isDone().should.equal(true);
                        
                        var query = GitDev.where({'user.id' : 1234});
                        query.findOne( function(err, gitDeveloper) {
                            if (!err) {
                                var now = new Date(),
                                    dateMinus2Day = now.setDate(now.getDate()-2);
                                gitDeveloper.updated_at = dateMinus2Day;
                                gitDeveloper.save(function(err) {
                                    if (!err) {
                                        var git_user_update = {
                                            'id': 1234,
                                            'login': 'My_Login',
                                            'name': 'Big Bad Developer'
                                        },
                                        git_repos_update = [
                                            {'id': 123,
                                              'name': 'my_first_repo1'
                                            }
                                        ]; 
                                        
                                        // Setup a new mock
                                        git_user_mock.filteringPath(function(path) {
                                                return path.split('?')[0];
                                            })
                                            .get('/users/my_login')
                                            .reply(200, git_user_update)
                                            .get('/users/my_login/repos')
                                            .reply(200, git_repos_update)
                                            .get('/users/my_login/events')
                                            .times(10)
                                            .reply(200, git_events)
                                            .get('/repos/my_login/my_first_repo1/languages')
                                            .reply(200, git_languages);
                                        
                                        gitstats_controller.git_developer_lookup({body: {username: 'my_login'}}, 
                                            {
                                                json: function(data) {
                                                    // Test User creation
                                                    data.user.id.should.equal(1234);
                                                    data.user.login.should.equal('My_Login');
                                                    data.user.login_lower.should.equal('my_login');
                                                    data.user.name.should.equal('Big Bad Developer');
                                                    // Test Repos portion
                                                    data.repos[0].id.should.equal(123);
                                                    data.repos[0].name.should.equal('my_first_repo1');
                                                    data.repos.length.should.equal(1);
                                                    
                                                    git_user_mock.isDone().should.equal(true);
                                                    done();
                                                }
                                        });
                                    }
                                });
                            }
                        });
                    }
            });
        });
        
        afterEach( function(done) {
        
            // clean up any remaining mocks
            nock.cleanAll();
        
            var query = GitDev.where({'user.id' : 1234});
            query.findOne( function(err, gitDeveloper) {
                if (!err) {
                    if (gitDeveloper) {
                        gitDeveloper.remove();
                    }
                    done();
                } else {
                    console.log(err);
                }
            });
        });
        
        it('A developer who is not found on github should return a status', function(done) {
            nock.cleanAll();
            git_user_mock = nock('https://api.github.com');
            git_user_mock.filteringPath(function(path) {
                return path.split('?')[0];
            })
            .get('/users/my_login')
            .reply(404, undefined)
            .get('/users/my_login/repos')
            .reply(404, undefined)
            .get('/users/my_login/events')
            .times(10);
            
            gitstats_controller.git_developer_lookup({body: {username: 'my_login'}},
                {
                    json: function(data) {
                        // Test User creation
                        data.status.should.equal('user not found');
                        
                        // Make sure that both mocks were actually used
                        git_user_mock.isDone().should.equal(true);
                        nock.cleanAll();
                        done();
                    }
            });
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