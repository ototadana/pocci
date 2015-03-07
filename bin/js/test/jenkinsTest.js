'use strict';
/*global describe, it, before, beforeEach, after*/
var assert = require('chai').assert;
var co = require('co');
var fs = require('fs');
var path = require('path');
var jenkinsLib = require('jenkins');
var thunkify = require('thunkify');
var jenkins = require('../lib/jenkins.js');
var yaml = require('../lib/yaml.js');
var webdriver = require('../lib/webdriver.js');


var listNodes = function*() {
  var jenkins = jenkinsLib('http://jenkinsci:password@server/jenkins');
  var listJenkinsNodes = thunkify(jenkins.node.list.bind(jenkins.node));

  var nodes = yield listJenkinsNodes();
  nodes.sort(function(a, b) {
    return a.displayName - b.displayName;
  });

  var jenkinsNodes = [];
  for(var i = 0; i < nodes.length; i++) {
    if(nodes[i].displayName !== 'master') {
      jenkinsNodes.push(nodes[i].displayName);
    }
  }
  return jenkinsNodes;
};

var assertEntries = function*(browser, options) {
  var config = yaml('./config/jenkins-slaves.yml');

  options.nodes.sort();
  var nodes = yield listNodes();
  console.log(nodes.length + ':' + options.nodes.length);
  assert.equal(nodes.length, options.nodes.length);
  assert.equal(nodes.length, Object.keys(config).length);

  for(var i = 0; i < options.nodes.length; i++) {
    console.log(options.nodes[i] +':'+ nodes[i]);
    assert.equal(options.nodes[i], nodes[i]);
    assert.equal(config[nodes[i]].image, 'ototadana/jenkins-slave-' + nodes[i]);
  }
};

var destroyNodes = function*() {
  var jenkins = jenkinsLib('http://jenkinsci:password@server/jenkins');
  var destroyNode = thunkify(jenkins.node.destroy.bind(jenkins.node));
  var nodes = yield listNodes();
  for(var i = 0; i < nodes.length; i++) {
    yield destroyNode(nodes[i]);
  }
};

describe('Jenkins', function() {
  var browser;
  this.timeout(120000);

  before(function(done) {
    co(function*() {
      yield webdriver.init();
      browser = webdriver.browser;
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  beforeEach(function(done) {
    try {
      fs.unlinkSync('./config/jenkins-slaves.yml');
    } catch(err) {
    }

    co(function*() {
      yield destroyNodes();
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

  it('creates a node', function(done) {
    co(function*() {
      // setup
      var yamlFile = path.resolve(__dirname, 'jenkinsTest-01.yml');
      var options = yaml(yamlFile);

      // when
      yield jenkins.setup(browser, options.jenkins, options.ldap);

      // then
      yield assertEntries(browser, options.jenkins);
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('creates 2 nodes', function(done) {
    co(function*() {
      // setup
      var yamlFile = path.resolve(__dirname, 'jenkinsTest-02.yml');
      var options = yaml(yamlFile);

      // when
      yield jenkins.setup(browser, options.jenkins, options.ldap);

      // then
      yield assertEntries(browser, options.jenkins);
      done();
    }).catch(function(err) {
      done(err);
    });
  });
});
