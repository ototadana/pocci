'use strict';
/*global describe, it*/
var co = require('co');
var server = require('co-request');
var path = require('path');
var setup = require('../lib/setup.js');
var assertStatus = require('../lib/util.js').assertStatus;
var sortById = require('../lib/util.js').sortById;
var assertResources = require('./testUtil.js').assertResources;

describe('ALMinium', function() {
  this.timeout(10 * 60 * 1000);
  var alminium = setup.alminium;

  it('creates issues', function(done) {
    var deleteProject = function*(request, name) {
      var response = yield server.del(request('/projects/' + name + '.json'));
      assertStatus(response, 'response.statusCode < 300 || response.statusCode === 404');
    };

    var cleanup = function*() {
      var url = alminium.defaults.url;
      yield setup.initBrowser();
      yield alminium.loginByAdmin(setup.browser, url);
      var request = yield alminium.createRequest(setup.browser, url);
      yield alminium.logout(setup.browser);
      yield deleteProject(request, 'example01');
      yield deleteProject(request, 'example02');
    };

    var assert01 = function*() {
      var result = (yield server.get(alminium.request('/projects/example01.json'))).body;
      yield assertResources(alminium.request, 'alminiumTest-01-specs.yml', function(specs) {
        specs.issues.edit = function(body) {result.issue = body.issues[0];};
        specs.memberships.edit = function(body) {result.user = body.memberships[0].user;};
      });
      return result;
    };

    var assert02 = function*(result01) {
      yield assertResources(alminium.request, 'alminiumTest-02-specs.yml', function(specs) {
        specs.example01Project.values = [['project.id', result01.project.id]];
        specs.example01Issues.values.push(['issues[0].id', result01.issue.id]);
        specs.example01Issues.edit = function(body) {sortById(body.issues);};
        specs.example01Memberships.values.push(['memberships[0].user.id', result01.user.id]);
        specs.example01Memberships.edit = function(body) {sortById(body.memberships);};
      });
    };

    co(function*() {
      yield cleanup();
      yield setup.setup(path.resolve(__dirname, 'alminiumTest-01.yml'), true);
      var result01 = yield assert01();

      yield alminium.logout(setup.browser);
      yield setup.setup(path.resolve(__dirname, 'alminiumTest-02.yml'));
      yield assert02(result01);

      done();
    }).catch(function(err) {
      done(err);
    });
  });

});
