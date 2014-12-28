'use strict';

// Dependenices
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;



var userObj = {
    login:{
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
};

  
// GitDev Schema
var GitDevSchema = new Schema({
  user: userObj
});


// Validations
GitDevSchema.path('user.login').validate(function(user) {
  return !!user.login;
}, 'Username cannot be blank');


// Assign model
mongoose.model('GitDev', GitDevSchema);