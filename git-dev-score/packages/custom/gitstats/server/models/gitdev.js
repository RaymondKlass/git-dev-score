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
GitDevSchema.virtual('eventsByType').get(function() {
  var eventsByType = {};
  this.events.forEach(function(event, index, events) {
    if (eventsByType.hasOwnProperty(event.type)) {
      eventsByType[event.type].count += 1;
    } else {
      eventsByType[event.type] = { count : 1 };
      eventsByType[event.type].label = eventTranslationTable[event.type];
    }
  });
  var eventsByTypeArray = [];
  for (var key in eventsByType) {
    if ( eventsByType.hasOwnProperty(key)) {
      eventsByTypeArray.push(eventsByType[key]);
    }
  }
  return eventsByTypeArray;
});




// Methods - handle the weighting process calculations via these

GitDevSchema.methods.aggregateRepoOwner = function aggregateRepoOwner() {
  // Handle the case that the user has no repos
  if ( !this.repos.length) {
    return null;
  }
  
  var repoAgg = {},
    user = '',
    userContribAgg = {},
    self = this;
  
  this.repos.forEach(function(repoElement, index, array) {
    repoAgg[repoElement.repo.id] = {
      owner:{
        c:0,
        a:0,
        d:0
      },
      others: {
        c:0,
        a:0,
        d:0
      }
    };
    
    repoElement.stats.forEach(function(statElement, statIndex, statArray) {
      if ( statElement.author.id === self.user.id) {
        user = 'owner';
      } else {
        user = 'others';
      }
      
      // We need to aggregate the stat element too.
      userContribAgg = {
        c:0,
        a:0, 
        d:0
      };
      
      statElement.weeks.forEach( function(statWeekElement, statWeekIndex, statWeekArray) {
        userContribAgg.c += statWeekElement.c;
        userContribAgg.a += statWeekElement.a;
        userContribAgg.d += statWeekElement.d;
      });
      
      repoAgg[repoElement.repo.id][user].c += userContribAgg.c;
      repoAgg[repoElement.repo.id][user].a += userContribAgg.a;
      repoAgg[repoElement.repo.id][user].d += userContribAgg.d;
      
    });

  });
  
  return(repoAgg);
  
};


// Assign model
mongoose.model('GitDev', GitDevSchema);