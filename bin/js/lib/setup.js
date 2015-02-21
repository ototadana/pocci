'use strict';
var git = require('./git.js');
var gitlab = require('./gitlab.js');
var jenkins = require('./jenkins.js');
var alminium = require('./alminium.js');
var ldap = require('./ldap.js');
var yaml = require('./yaml.js');
var webdriver = require('./webdriver.js');

module.exports = function*(yamlFile) {
  var options = yaml(yamlFile);

  if(options.ldap) {
    console.log('Add users...');
    yield ldap.add(options.ldap);
  }

  var browser;
  if(options.gitlab || options.alminium || options.jenkins) {
    console.log('Start Selenium Webdriver...');
    yield webdriver.init();
    browser = webdriver.browser;
  }

  if(options.alminium) {
    console.log('Setup ALMinium...');
    yield alminium.setup(browser, options.alminium, options.ldap);
  }

  if(options.gitlab) {
    console.log('Setup GitLab...');
    yield gitlab.setup(browser, options.gitlab, options.ldap);
  }

  if(options.git) {
    console.log('Import codes to Git repository...');
    yield git.import(options.git, options.ldap);
  }

  if(options.jenkins) {
    console.log('Setup Jenkins...');
    yield jenkins.setup(browser, options.jenkins, options.ldap, options.git);
  }

  if(browser) {
    console.log('Closing browser...');
    yield browser.yieldable.end();
  }
};
