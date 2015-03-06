'use strict';
var fs = require('fs');
var thunkify = require('thunkify');
var jenkinsLib = require('jenkins');
var path = require('path');
var ldapDefaults = require('./ldap.js').defaults;
var util = require('./util.js');

var createJob = function*(jenkins, job) {
  var destroy = thunkify(jenkins.job.destroy.bind(jenkins.job));
  var create = thunkify(jenkins.job.create.bind(jenkins.job));
  var replaceRepositoryUrl = function(text, repositoryUrl) {
    return text.replace('${REPOSITORY_URL}', repositoryUrl);
  };

  try {
    yield destroy(job.jobName);
  } catch(e) {
    // ignore
  }

  var configXmlFilePath = path.resolve(__dirname, 'jenkins-job-config.xml');
  var configXml = fs.readFileSync(configXmlFilePath, 'utf8');
  yield create(job.jobName, replaceRepositoryUrl(configXml, job.repositoryUrl));
};

var createJobs = function*(jenkins, jobs, gitOptions, scmUrl) {
  var toUrl = function(path) {
    return util.getURL(scmUrl, null, path);
  };

  var toJobs = function(repositories) {
    var jobs = [];
    for(var i = 0; i < repositories.length; i++) {
      var job = {
        jobName:        path.basename(repositories[i].localPath),
        repositoryUrl:  toUrl(repositories[i].remotePath)
      };
      jobs.push(job);
    }
    return jobs;
  };

  var normalize = function(repositories) {
    if(jobs === 'repositories') {
      return toJobs(repositories);
    }
    return util.toArray(jobs);
  };

  var repositories = (gitOptions)? gitOptions.repositories : [];
  jobs = normalize(util.toArray(repositories));
  for(var i = 0; i < jobs.length; i++) {
    yield createJob(jenkins, jobs[i]);
  }
};

var writeNodeConf = function(node, secret) {
  var templateFilePath = path.resolve(__dirname, 'jenkins-slaves-template.yml');
  var text = fs.readFileSync(templateFilePath, 'utf8')
              .replace(/__NAME/g, node).replace(/__SECRET/g, secret);
  fs.appendFileSync('./config/jenkins-slaves.yml', text);
};

var createNode = function*(jenkins, nodeName, ldapOptions) {
  var destroy = thunkify(jenkins.node.destroy.bind(jenkins.node));
  var create = thunkify(jenkins.node.create.bind(jenkins.node));

  try {
    yield destroy(nodeName);
  } catch(e) {
    // ignore
  }

  var options = {
    name: nodeName,
    remoteFS: '/var/jenkins_home',
    numExecutors: 1,
    exclusive: false
  };

  yield create(options);
  if(!ldapOptions) {
    writeNodeConf(nodeName, '');
  }
};

var createNodes = function*(jenkins, nodes, ldapOptions) {
  nodes = util.toArray(nodes);
  for(var i = 0; i < nodes.length; i++) {
    yield createNode(jenkins, nodes[i], ldapOptions);
  }
};

var enableLdap = function*(browser, url, ldapOptions, ldapUrl, user) {
  var enableSecurity = function*() {
    var isSelected = (yield browser.yieldable.isSelected(useSecuritySelector))[0];
    if (!isSelected) {
      yield browser.yieldable.click('input[type="checkbox"][name="_.useSecurity"]');
    }

    yield browser.yieldable.click('#radio-block-2');
    yield browser.yieldable.click('#yui-gen1-button');

    var uid = ldapOptions.attrLogin || ldapDefaults.attrLogin;
    browser
      .setValue('input[type="text"][name="_.server"]', ldapUrl)
      .setValue('input[type="text"][name="_.rootDN"]', ldapOptions.baseDn || ldapDefaults.baseDn)
      .setValue('input[type="text"][name="_.userSearch"]', uid + '={0}')
      .setValue('input[type="text"][name="_.managerDN"]', ldapOptions.bindDn || ldapDefaults.bindDn)
      .setValue('input[type="password"][name="_.managerPasswordSecret"]', ldapOptions.bindPassword || ldapDefaults.bindPassword)
      .setValue('input[type="text"][name="_.displayNameAttributeName"]', ldapOptions.attrLogin || ldapDefaults.attrLogin);

    yield browser.yieldable.call();
    yield browser.yieldable.click('#yui-gen6-button');
  };

  browser.url(url + '/configureSecurity/');
  var useSecuritySelector = 'input[type="checkbox"][name="_.useSecurity"]';
  var isDisabledSecurity = (yield browser.yieldable.isExisting(useSecuritySelector))[0];

  if(isDisabledSecurity) {
    yield enableSecurity();
  }

  var loginUser = util.getUser(user, ldapOptions.users);
  browser
    .url(url + '/login')
    .setValue('#j_username', loginUser.uid)
    .setValue('input[type="password"][name="j_password"]', loginUser.userPassword);
  yield browser.yieldable.call();
  yield browser.yieldable.click('button');

  if(isDisabledSecurity) {
    browser.url(url + '/configureSecurity/');
    yield browser.yieldable.click('#radio-block-8');
    yield browser.yieldable.click('#yui-gen6-button');
  }

  return loginUser;
};

var saveSecret = function*(browser, url, node) {
  browser.url(url + '/computer/' + node);
  var text = (yield browser.yieldable.getText('pre'))[0];
  var secret = text.replace(/.*-secret/,'-secret');
  writeNodeConf(node, secret);
};

var saveSecrets = function*(browser, url, nodes) {
  nodes = util.toArray(nodes);
  for(var i = 0; i < nodes.length; i++) {
    yield saveSecret(browser, url, nodes[i]);
  }
};

module.exports = {
  defaults: {
    url:    'http://server/jenkins',
    scmUrl: 'http://server'
  },
  setup: function*(browser, options, ldapOptions, gitOptions) {
    var url = options.url || this.defaults.url;
    var apiUrl = url;
    if(ldapOptions) {
      var ldapUrl = options.ldapUrl || ldapOptions.url || ldapDefaults.url;
      var loginUser = yield enableLdap(browser, url, ldapOptions, ldapUrl, options.user);
      apiUrl = util.getURL(url, loginUser);
    }

    var jenkins = jenkinsLib(apiUrl);

    if(options.nodes) {
      yield createNodes(jenkins, options.nodes, ldapOptions);
      yield saveSecrets(browser, url, options.nodes);
    }

    if(options.jobs) {
      var scmUrl = options.scmUrl || this.defaults.scmUrl;
      yield createJobs(jenkins, options.jobs, gitOptions, scmUrl);
    }
  }
};
