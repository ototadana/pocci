'use strict';
/*global describe, it*/
var assert = require('chai').assert;
var co = require('co');
var server = require('co-request');
var path = require('path');
var alminium = require('../lib/alminium.js');
var setup = require('../lib/setup.js');
var yaml = require('../lib/yaml.js');

var assertEntries = function*(options) {
  
  var response = yield server.get({
    url: alminium.defaults.url + '/issues.json?project_id=' + options.projects.projectId,
    json : true
  });

  var body = response.body;
  assert.equal(body.issues.length, 2);
  body.issues.sort(function(a, b) {
    return a.id - b.id;
  });
  assert.equal(body.issues[0].priority.id, 2);
  assert.equal(body.issues[0].subject, 'title only');
  assert.isUndefined(body.issues[0].description);
  assert.equal(body.issues[1].priority.id, 4);
  assert.equal(body.issues[1].subject, 'example');
  assert.equal(body.issues[1].description, 'line 1\r\nline 2\r\nline 3\r\n');
};

describe('ALMinium', function() {
  this.timeout(60000);

  it('creates issues', function(done) {
    co(function*() {
      var yamlFile = path.resolve(__dirname, 'alminiumTest-01.yml');
      var options = yaml(yamlFile).alminium;
      yield setup(yamlFile);
      yield assertEntries(options);
      done();
    }).catch(function(err) {
      done(err);
    });
  });
});
