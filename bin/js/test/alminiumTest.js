'use strict';
/*global describe, it*/
var co = require('co');
var path = require('path');
var setup = require('../lib/setup.js');
var resq = require('./resq.js');

describe('ALMinium', function() {
  this.timeout(10 * 60 * 1000);
  var alminium = setup.alminium;

  it('creates issues', function(done) {
    co(function*() {
      var url = alminium.defaults.url;
      yield setup.initBrowser();
      yield alminium.loginByAdmin(setup.browser, url);
      var request = yield alminium.createRequest(setup.browser, url);
      yield alminium.logout(setup.browser);

      // cleanup & setup
      var client = resq(request);
      yield client.del('/projects/example01.json');
      yield client.del('/projects/example02.json');

      // when
      yield setup.setup(path.resolve(__dirname, 'alminiumTest-01.yml'), true);

      // then
      var specs01 = client.readSpecs('alminiumTest-01-specs.yml');
      yield client.assert(specs01);

      // setup
      yield alminium.logout(setup.browser);

      // when
      yield setup.setup(path.resolve(__dirname, 'alminiumTest-02.yml'));

      // then
      var specs02 = client.readSpecs('alminiumTest-02-specs.yml');
      specs02.example01Project.variables = {
        projectId: specs01.issues.response.body.issues[0].project.id
      };
      specs02.example01Issues.variables = {
        issueId: specs01.issues.response.body.issues[0].id
      };
      specs02.example01Memberships.variables = {
        userId: specs01.memberships.response.body.memberships[0].user.id
      };

      yield client.assert(specs02);

      done();
    }).catch(function(err) {
      done(err);
    });
  });

});
