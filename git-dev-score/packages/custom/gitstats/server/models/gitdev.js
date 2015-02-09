'use strict';

// Dependenices
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var eventTranslationTable = {
  'CreateEvent': 'Create Repo',
  'PushEvent': 'Push',
  'ForkEvent': 'Fork',
  'WatchEvent': 'Watch',
  'DeleteEvent': 'Delete',
  'IssuesEvent': 'Issue',
  'IssueCommentEvent': 'Comment',
  'PullRequestEvent': 'Pull Request',
  'ReleaseEvent': 'Release',
  'CommitCommentEvent': 'Commit Comment'
};


var userObj = {
    login:{
      type: String,
      index: {
        unique: true
      }
    },
    login_lower: {
      type: String,
      index: {
        unique: true
      }
    },
    id: {
      type: Number,
      index: {
        unique: true
      }
    },
    avatar_url: String,
    gravatar_id: String,
    url: String,
    html_url: String,
    followers_url: String,
    following_url: String,
    gists_url: String,
    starred_url: String,
    subscriptions_url: String,
    organizations_url: String,
    repos_url: String,
    events_url: String,
    received_events_url: String,
    type: { type:String},
    site_admin: String,
    name: String,
    company: String,
    blog: String,
    location: String,
    email: String,
    hireable: Boolean,
    bio: String,
    public_repos: Number,
    public_gists: Number,
    followers: Number,
    following: Number,
    created_at: Date,
    updated_at: Date
  },
  repoObj = {
    id: {
      type: Number,
      index: {unique: true}
    },
    languages: {},
    name: String,
    full_name: String,
    private: Boolean,
    html_url: String,
    description: String,
    fork: Boolean,
    url: String,
    forks_url: String,
    keys_url: String,
    collaborators_url: String,
    teams_url: String,
    hooks_url: String,
    issue_events_url: String,
    events_url: String,
    assignees_url: String,
    branches_url: String,
    tags_url: String,
    blobs_url: String,
    git_tags_url: String,
    git_refs_url: String,
    trees_url: String,
    statuses_url: String,
    languages_url: String,
    stargazers_url: String,
    contributors_url: String,
    subscribers_url: String,
    subscription_url: String,
    commits_url: String,
    git_commits_url: String,
    comments_url: String,
    issue_comment_url: String,
    contents_url: String,
    compare_url: String,
    merges_url: String,
    archive_url: String,
    downloads_url: String,
    issues_url: String,
    pulls_url: String,
    milestones_url: String,
    notifications_url: String,
    labels_url: String,
    releases_url: String,
    created_at: Date,
    updated_at: Date,
    pushed_at: Date,
    git_url: String,
    ssh_url: String,
    clone_url: String,
    svn_url: String,
    homepage: String,
    size: Number,
    stargazers_count:  Number,
    watchers_count: Number,
    language: String,
    has_issues: Number,
    has_downloads: Boolean,
    has_wiki: Boolean,
    has_pages: Boolean,
    forks_count: Number,
    mirror_url: String,
    open_issues_count: Number,
    forks: Number,
    open_issues: Number,
    watchers: Number,
    default_branch: String
  },
  gitEventObj = {
    type: {
      type: String,
    },
    public: {
      type: String
    },
    repo: {
      id: Number,
      name: String,
      url: String
    },
    actor: {
      id: Number,
      login: String,
      gravatar_url: String,
      avatar_url: String,
      url: String
    },
    org: {
      id: Number,
      login: String,
      gravatar_url: String,
      avatar_url: String,
    },
    payload: {},
    created: Date,
    id: {
      type: Number,
      index: {unique: true}
    }
  };

  
// GitDev Schema
var GitDevSchema = new Schema({
  user: userObj,
  repos: [ repoObj ],
  events: [ gitEventObj ],
  updated_at: { type: Date, default: Date.now }
});

GitDevSchema.set('toJSON', {
  virtuals: true
});

// Validations
GitDevSchema.path('user.login').validate(function(user) {
  return !!user;
}, 'Username cannot be blank');



// Virtual Fields

// Simple aggregation for events by type
GitDevSchema.virtual('eventsAgg').get(function() {
  var eventsByType = {},
      eventsByRepo = {};
  this.events.forEach(function(event, index, events) {
    // Aggregate event Types
    if (eventsByType.hasOwnProperty(event.type)) {
      eventsByType[event.type].count += 1;
    } else {
      eventsByType[event.type] = { count : 1 };
      eventsByType[event.type].label = eventTranslationTable[event.type];
    }
    
    // Aggregate events by repo
    if (eventsByRepo.hasOwnProperty(event.repo.id)) {
      eventsByRepo[event.repo.id].count += 1;
    } else {
      eventsByRepo[event.repo.id] = { count : 1 };
      eventsByRepo[event.repo.id].label = event.repo.name;
      eventsByRepo[event.repo.id].url = event.repo.url;
    }
    
  });
  var eventsByTypeArray = [],
      eventsByRepoArray = [];
  for (var key in eventsByType) {
    if ( eventsByType.hasOwnProperty(key)) {
      eventsByTypeArray.push(eventsByType[key]);
    }
  }
  
  for (key in eventsByRepo) {
    if ( eventsByRepo.hasOwnProperty(key)) {
      eventsByRepoArray.push(eventsByRepo[key]);
    }
  }
  
  return {eventsByType: eventsByTypeArray, 
          eventsByRepo: eventsByRepoArray};
});


// Aggregation for Language Stats
GitDevSchema.virtual('languageAgg').get(function() {
  var languageAgg = {};
  this.repos.forEach(function(repo, index, repos_array) {
    if ( repo.languages && repo.fork === false) {
      for ( var key in repo.languages ) {
        if ( repo.languages.hasOwnProperty(key) ) {
          if ( !languageAgg.hasOwnProperty(key) ) {
            languageAgg[key] = 0;
          }
          languageAgg[key] += repo.languages[key];
        }
      }
    }
  });
  // return in a way that's more usuable in a chart
  var languageAggArray = [];
  for (var key in languageAgg) {
    if( languageAgg.hasOwnProperty(key) ) {
      languageAggArray.push({count: languageAgg[key], label: key});
    }
  }
  return languageAggArray;
});


// Get some recent Commits (See Code Samples)
GitDevSchema.virtual('recentCommits').get(function() {

});


// Assign model
mongoose.model('GitDev', GitDevSchema);