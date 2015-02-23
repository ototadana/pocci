'use strict';
/*global describe, it, before, after*/
var assert = require('chai').assert;
var co = require('co');
var retry = require('co-retry');
var jenkinsLib = require('jenkins');
var thunkify = require('thunkify');
var webdriver = require('../lib/webdriver.js');

describe('Login', function() {
  this.timeout(60000);
  var browser;

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

  it('ldap', function(done) {
    co(function*() {
      browser
        .url('http://server/ldap/cmd.php?cmd=login_form')
        .setValue('#login', 'cn=admin,dc=example,dc=com')
        .setValue('#password', 'admin')
        .submitForm('form');

      yield browser.yieldable.call();

      browser.url('http://server/ldap/');
      var text = (yield browser.yieldable.getText('td.logged_in'))[0];
      assert.equal(text, 'Logged in as: cn=admin');

      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('jenkins', function(done) {
    co(function*() {
      browser
        .url('http://server/jenkins/login')
        .setValue('#j_username', 'bouze')
        .setValue('input[type="password"][name="j_password"]', 'password');

      yield browser.yieldable.call();
      yield browser.yieldable.click('button');

      browser.url('http://server/jenkins/');
      var text = (yield browser.yieldable.getText('#header div.login a[href="/jenkins/user/bouze"] > b'))[0];
      assert.equal(text, 'bouze');

      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('sonar', function(done) {
    co(function*() {
      browser
        .url('http://server/sonar/sessions/new')
        .setValue('#login', 'jenkinsci')
        .setValue('#password', 'password')
        .submitForm('form');

      yield browser.yieldable.call();

      browser.url('http://server/sonar/');
      var text = (yield browser.yieldable.getText('#nav a span'))[0];
      assert.equal(text, 'jenkinsci');

      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('portal', function(done) {
    var loginGitHub = function*() {
      browser
        .url('http://server/users/sign_in')
        .setValue('#username', 'bouze')
        .setValue('#password', 'password')
        .submitForm('#new_ldap_user');

      yield browser.yieldable.call();

      browser.url('http://server/profile/');
      var text = (yield browser.yieldable.getValue('#user_name'))[0];
      assert.equal(text, 'bouze');
    };

    var loginALMinium = function*() {
      browser
        .url('http://server/login')
        .setValue('#username', 'bouze')
        .setValue('#password', 'password')
        .submitForm('#login-form form');

      yield browser.yieldable.call();

      browser.url('http://server/');
      var text = (yield browser.yieldable.getText('#loggedas > a'))[0];
      assert.equal(text, 'bouze');
    };

    co(function*() {
      if(process.env.TEMPLATE_NO === '1') {
        yield loginGitHub();
      } else {
        yield loginALMinium();
      }

      done();
    }).catch(function(err) {
      done(err);
    });
  });

});

describe('Jenkins Job', function() {
  it('build', function(done) {
    this.timeout(10 * 60 * 1000);

    co(function*() {
      var jenkins = jenkinsLib('http://jenkinsci:password@server/jenkins');
      var build = thunkify(jenkins.job.build.bind(jenkins.job));
      var get = thunkify(jenkins.job.get.bind(jenkins.job));

      var assertNotBuilt = function*(name) {
        var data = yield get(name);
        assert.equal(data.name, name);
        assert.equal(data.color, 'notbuilt');
        assert.equal(data.builds.length, 0);
      };

      var assertBuilt = function*(name) {
        var data = yield get(name);
        if(data.color === 'notbuilt' || data.color === 'notbuilt_anime') {
          throw new Error('job:' + name + ', color:' + data.color);
        }
      };

      var assertBuiltAll = function*() {
        yield assertBuilt('example-java');
        yield assertBuilt('example-nodejs');
      };

      var assertBlue = function*(name) {
        var data = yield get(name);
        assert.equal(data.color, 'blue');
      };

      yield assertNotBuilt('example-java');
      yield assertNotBuilt('example-nodejs');

      yield build('example-java');
      yield build('example-nodejs');

      yield retry(assertBuiltAll, {retries: 300});

      yield assertBlue('example-java');
      yield assertBlue('example-nodejs');

      done();
    }).catch(function(err) {
      done(err);
    });

  });
});
