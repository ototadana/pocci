'use strict';
/*global describe, it, before, after*/
var assert = require('chai').assert;
var co = require('co');
var server = require('co-request');
var path = require('path');
var gitlab = require('../lib/gitlab.js');
var yaml = require('../lib/yaml.js');
var webdriver = require('../lib/webdriver.js');

var assertEntries = function*(browser, options) {

  var url = gitlab.defaults.url;
  yield gitlab.loginByAdmin(browser, url);
  var key = yield gitlab.getApiAccessKey(browser, url);
  var request = gitlab.createRequest(url, key);

  var getProjectId = function*() {
    var response = 
      yield server.get(request('/projects/search/' + options.groups.projects.projectName));
    return response.body[0].id;
  };
  var projectId = yield getProjectId();

  var getIssues = function*() {
    var response = 
      yield server.get(request('/projects/' + projectId + '/issues'));
    return response.body;
  };

  var issues = yield getIssues();
  console.log(issues);
  assert.equal(issues.length, 2);
  issues.sort(function(a, b) {
    return a.id - b.id;
  });
  assert.equal(issues[0].title, 'Title Only');
  assert.isNull(issues[0].description);
  assert.equal(issues[1].title, 'Example');
  assert.equal(issues[1].description, 'Line 1\nLine 2\nLine 3\n');
};

describe('GitLab', function() {
  var browser;
  this.timeout(60000);

  before(function(done) {
    co(function*() {
      yield webdriver.init();
      browser = webdriver.browser;
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  after(function(done) {
    co(function*() {
      yield browser.yieldable.end();
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('creates issues', function(done) {
    co(function*() {
      var yamlFile = path.resolve(__dirname, 'gitlabTest-01.yml');
      var options = yaml(yamlFile);
      yield gitlab.setup(browser, options.gitlab, options.ldap);
      yield assertEntries(browser, options.gitlab);
      done();
    }).catch(function(err) {
      done(err);
    });
  });
});
