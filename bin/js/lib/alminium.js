/*jshint sub:true*/
'use strict';
var server = require('co-request');
var urlparse = require('url').parse;
var ldapDefaults = require('./ldap.js').defaults;
var toArray = require('./util.js').toArray;
var assertStatus = require('./util.js').assertStatus;

var logout = function*(browser) {
  browser.click('a.logout');
  yield browser.yieldable.call();
};

var login = function*(browser, url, user, password) {
  browser
    .url(url + '/login')
    .setValue('#username', user)
    .setValue('#password', password)
    .submitForm('#login-form form');
  yield browser.yieldable.call();
};

var loginByAdmin = function*(browser, url) {
  yield login(browser, url, 'admin', 'admin');
};

var enableWebService = function*(browser, url) {
  browser.url(url + '/settings?tab=authentication');
  var isSelected = (yield browser.yieldable.isSelected('#settings_rest_api_enabled'))[0];
  if (!isSelected) {
    browser
      .click('#settings_rest_api_enabled')
      .click('#tab-content-authentication > form > input[type="submit"]');
  }
};

var deleteEntry = function(browser, url) {
  browser
    .url(url + '/auth_sources')
    .element('a.icon.icon-del', function(err) {
      if(!err) {
        browser
          .click('a.icon.icon-del')
          .alertAccept();
      }
    });
};

var enableLdap = function*(browser, url, ldapOptions, ldapUrl) {
  deleteEntry(browser, url);

  browser
    .url(url + '/auth_sources/new')
    .setValue('#auth_source_name', ldapOptions.name || 'ldap')
    .setValue('#auth_source_host', ldapUrl.hostname)
    .setValue('#auth_source_port', ldapUrl.port || '389')
    .setValue('#auth_source_account', ldapOptions.bindDn || ldapDefaults.bindDn)
    .setValue('#auth_source_account_password', ldapOptions.bindPassword || ldapDefaults.bindPassword)
    .setValue('#auth_source_base_dn', ldapOptions.baseDn || ldapDefaults.baseDn)
    .setValue('#auth_source_attr_login', ldapOptions.attrLogin || ldapDefaults.attrLogin)
    .setValue('#auth_source_attr_firstname', ldapOptions.attrFirstName || ldapDefaults.attrFirstName)
    .setValue('#auth_source_attr_lastname', ldapOptions.attrLastName || ldapDefaults.attrLastName)
    .setValue('#auth_source_attr_mail', ldapOptions.attrMail || ldapDefaults.attrMail);

  var isSelected = (yield browser.yieldable.isSelected('#auth_source_onthefly_register'))[0];
  if (!isSelected) {
    browser
      .click('#auth_source_onthefly_register')
      .click('#auth_source_form > input[type="submit"]');
  }
};

var getApiAccessKey = function*(browser, url) {
  browser.url(url + '/my/account');
  return yield browser.yieldable.getHTML('#api-access-key', false);
};

var deleteProject = function*(url, apiAccessKey, projectId) {
  var request = {
    method: 'DELETE',
    url: url + '/projects/' + projectId + '.json',
    headers: {
      'X-Redmine-API-Key': apiAccessKey
    }
  };
  var response = yield server(request);

  assertStatus(response, 'response.statusCode < 300 || response.statusCode === 404');
};

var createProject = function(browser, url, projectId) {
  browser
    .url(url + '/projects/new')
    .setValue('#project_name', projectId)
    .setValue('#project_identifier', projectId)
    .selectByValue('select#project_scm', 'Git')
    .click('#project_enabled_module_names_backlogs')
    .click('input[type="submit"][name="commit"]');
};

var createRepository = function(browser, url, projectId, repositoryId) {
  browser
    .url(url + '/projects/' + projectId + '/repositories/new')
    .selectByValue('#repository_scm', 'Git')
    .pause(2000)
    .setValue('#repository_url', '/var/opt/alminium/git/' + projectId + '.' + repositoryId)
    .setValue('#repository_identifier', repositoryId)
    .click('#repository-form > div.box.tabular > p:nth-child(4) > input[type="submit"]:nth-child(3)');
};

var getUsers = function*(url, apiAccessKey) {
  var response = yield server.get({
    url: url + '/users.json',
    headers: {
      'X-Redmine-API-Key': apiAccessKey
    }
  });

  assertStatus(response, 'response.statusCode < 300');

  return JSON.parse(response.body).users;
};

var deleteUser = function*(url, apiAccessKey, id) {
  var response = yield server.del({
    url: url + '/users/' + id + '.json',
    headers: {
      'X-Redmine-API-Key': apiAccessKey
    }
  });

  assertStatus(response, 'response.statusCode < 300');
};

var deleteUsers = function*(url, apiAccessKey) {
  var users = yield getUsers(url, apiAccessKey);
  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    if(user.login !== 'admin') {
      yield deleteUser(url, apiAccessKey, user.id);
      return;
    }
  }
};

var addProjectMember = function*(url, apiAccessKey, projectId, login) {

  var addProject = function*(id) {
    var response = yield server.post({
      url: url + '/projects/' + projectId + '/memberships.json',
      headers : {
        'X-Redmine-API-Key': apiAccessKey,
        'Content-Type': 'application/json'
      },
      json : true,
      body : {
        membership : {
          'user_id' : id,
          'role_ids' : [3, 4]
        }
      }
    });

    assertStatus(response, 'response.statusCode < 300');
  };

  var users = yield getUsers(url, apiAccessKey);
  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    if(user.login === login) {
      yield addProject(user.id);
      return;
    }
  }

  throw new Error('cannot find user : ' + login);
};

var createIssue = function*(url, apiAccessKey, projectId, issueOrSubject) {
  var issue;

  if(typeof issueOrSubject === 'object') {
    issue = issueOrSubject;
    issue['project_id'] = projectId;
    issue['tracker_id'] = issue['tracker_id'] || 3;
  } else {
    issue = {
      'project_id' : projectId,
      'tracker_id' : 3,
      'subject' : '' + issueOrSubject
    };
  }

  var response = yield server.post({
    url: url + '/issues.json',
    headers : {
      'X-Redmine-API-Key': apiAccessKey,
      'Content-Type': 'application/json'
    },
    json : true,
    body : { 'issue' : issue }
  });

  assertStatus(response, 'response.statusCode < 300');
};

var createRepositories = function(browser, url, projectId, repositories) {
  for(var i = 0; i < repositories.length; i++) {
    createRepository(browser, url, projectId, repositories[i]);
  }
};

var addProjectMembers = function*(url, key, projectId, members) {
  for(var i = 0; i < members.length; i++) {
    yield addProjectMember(url, key, projectId, members[i]);
  }
};

var createIssues = function*(url, key, projectId, issues) {
  for(var i = 0; i < issues.length; i++) {
    yield createIssue(url, key, projectId, issues[i]);
  }
};

var addDefaultMembers = function(users) {
  var members = [];
  for(var i = 0; i < users.length; i++) {
    members.push(users[i].uid);
  }
  return members;
};

var setupProject = function*(browser, url, key, options, users) {

  yield deleteProject(url, key, options.projectId);
  createProject(browser, url, options.projectId);

  if(options.repositories) {
    createRepositories(browser, url, options.projectId, options.repositories);
  }

  yield browser.yieldable.call();

  var members = options.members || addDefaultMembers(users);
  if(members) {
    yield addProjectMembers(url, key, options.projectId, members);
  }

  if(options.issues) {
    yield createIssues(url, key, options.projectId, options.issues);
  }
};

var setupProjects = function*(browser, url, key, projects, users) {
  for(var i = 0; i < projects.length; i++) {
    yield setupProject(browser, url, key, projects[i], users);
  }
};

var addUsers = function*(browser, url, users) {
  for(var i = 0; i < users.length; i++) {
    yield logout(browser);
    yield login(browser, url, users[i].uid, users[i].userPassword);
  }
};

module.exports = {
  defaults: {
    url: 'http://server'
  },
  setup: function*(browser, options, ldapOptions) {
    var url = options.url || this.defaults.url;
    var users = toArray(options.users || ldapOptions.users);

    yield loginByAdmin(browser, url);
    yield enableWebService(browser, url);
    var key = (yield getApiAccessKey(browser, url))[0];
    yield deleteUsers(url, key);

    if(ldapOptions) {
      var ldapUrl = options.ldapUrl || ldapOptions.url || ldapDefaults.url;
      yield enableLdap(browser, url, ldapOptions, urlparse(ldapUrl));
    }

    if(users) {
      yield addUsers(browser, url, users);
    }

    if(options.projects) {
      yield logout(browser);
      yield loginByAdmin(browser, url);
      yield setupProjects(browser, url, key, toArray(options.projects), users);
    }
  }
};
