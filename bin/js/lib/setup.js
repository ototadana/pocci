'use strict';
var git = require('./git.js');
var gitlab = require('./gitlab.js');
var jenkins = require('./jenkins.js');
var alminium = require('./alminium.js');
var ldap = require('./ldap.js');
var yaml = require('./yaml.js');
var webdriver = require('./webdriver.js');

var initBrowser = function*() {
  if(!module.exports.browser) {
    yield webdriver.init();
    module.exports.browser = webdriver.browser;
  }
};

var setup = function*(yamlFile, keepOpenBrowser) {
  var options = yaml(yamlFile);

  if(options.ldap) {
    console.log('*** Add users...');
    yield ldap.add(options.ldap);
  }

  var browser;
  if(options.gitlab || options.alminium || options.jenkins) {
    console.log('*** Start Selenium Webdriver...');
    yield initBrowser();
    browser = module.exports.browser;
  }

  if(options.alminium) {
    console.log('*** Setup ALMinium...');
    yield alminium.setup(browser, options.alminium, options.ldap);
  }

  if(options.gitlab) {
    console.log('*** Setup GitLab...');
    yield gitlab.setup(browser, options.gitlab, options.ldap);
  }

  if(options.git) {
    console.log('*** Import codes to Git repository...');
    yield git.import(options.git, options.ldap);
  }

  if(options.jenkins) {
    console.log('*** Setup Jenkins...');
    yield jenkins.setup(browser, options.jenkins, options.ldap, options.git);
  }

  if(browser && !keepOpenBrowser) {
    console.log('*** Closing browser...');
    yield browser.yieldable.end();
  }
};

module.exports.setup = setup;
module.exports.initBrowser = initBrowser;
module.exports.alminium = alminium;
module.exports.gitlab = gitlab;
module.exports.git = git;
module.exports.jenkins = jenkins;
