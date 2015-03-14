'use strict';
/*global describe, it*/
/*jshint camelcase:false*/
var co = require('co');
var path = require('path');
var setup = require('../lib/setup.js');
var resq = require('./resq.js');


describe('GitLab', function() {
  this.timeout(10 * 60 * 1000);

  it('creates issues', function(done) {
    co(function*() {
      var gitlab = setup.gitlab;
      var url = gitlab.defaults.url;
      yield setup.initBrowser();
      yield gitlab.loginByAdmin(setup.browser, url);
      var request = yield gitlab.createRequest(setup.browser, url);
      yield gitlab.logout(setup.browser);

      // cleanup & setup
      var client = resq(request);
      yield client.del('/projects/${id}', {id: 'body[0].id@/projects/search/project01'});
      yield client.del('/groups/${id}', {id: 'body[0].id@/groups?search=group01'});
      yield client.del('/groups/${id}', {id: 'body[0].id@/groups?search=group02'});

      // when
      yield setup.setup(path.resolve(__dirname, 'gitlabTest-01.yml'), true);

      // then
      var specs01 = client.readSpecs('gitlabTest-01-specs.yml');
      yield client.assert(specs01);

      // when
      yield setup.setup(path.resolve(__dirname, 'gitlabTest-02.yml'));

      // then
      var specs02 = client.readSpecs('gitlabTest-02-specs.yml');
      specs02.group01.variables = {
        groupId: specs01.project01.response.body[0].namespace.id
      };
      specs02.project01.variables = {
        groupId: specs01.project01.response.body[0].namespace.id,
        projectId: specs01.project01.response.body[0].id
      };
      specs02.project01_issues.variables = {
        issueId: specs01.project01_issues.response.body[0].id,
        projectId: specs01.project01_issues.response.body[0].project_id
      };
      yield client.assert(specs02);

      done();
    }).catch(function(err) {
      done(err);
    });
  });
});
