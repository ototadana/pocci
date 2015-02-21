'use strict';
var server = require('co-request');
var toArray = require('./util.js').toArray;
var assertStatus = require('./util.js').assertStatus;

var logout = function*(browser) {
  browser.click('a[href="/users/sign_out"]');
  yield browser.yieldable.call();
};

var login = function*(browser, url, user, password) {
  browser
    .url(url + '/users/sign_in')
    .setValue('#username', user)
    .setValue('#password', password)
    .submitForm('#new_ldap_user');
  yield browser.yieldable.call();
};

var newPassword = function*(browser, url, password) {
  browser
    .url(url + '/profile/password/new')
    .setValue('#user_current_password', password)
    .setValue('#user_password', password)
    .setValue('#user_password_confirmation', password)
    .submitForm('#edit_user_1');
  yield browser.yieldable.call();
};


var __loginByAdmin = function*(browser, url, password) {
  browser.url(url + '/users/sign_in');
  yield browser.yieldable.call();
  yield browser.yieldable.click('a[href="#tab-signin"]');
  browser
    .setValue('#user_login', 'root')
    .setValue('#user_password', password)
    .submitForm('#new_user');
  yield browser.yieldable.call();
};

var loginByAdmin = function*(browser, url) {
  var password = '5iveL!fe';
  yield __loginByAdmin(browser, url, password);
  yield newPassword(browser, url, password);
  yield __loginByAdmin(browser, url, password);
  browser.saveScreenshot('screen.png');
  yield browser.yieldable.call();
};

var getApiAccessKey = function*(browser, url) {
  browser.url(url + '/profile/account');
  return (yield browser.yieldable.getValue('#token'))[0];
};

var createRequest = function(url, apiAccessKey) {
  return function(path, body) {
    var request =  {
      url: url + '/api/v3' + path,
      json: true,
      headers: {
        'PRIVATE-TOKEN': apiAccessKey
      }
    };
    if(body) {
      request.body = body;
    }
    return request;
  };
};

var deleteProject = function*(request, projectName) {
  var response = 
    yield server.get(request('/projects/search/' + projectName));
  var body = response.body[0];
  if(body && body.id) {
    yield server.del(request('/projects/' + body.id));
  }
};

var createProject = function*(request, projectName, groupId) {
  var response = yield server.post(request('/projects', {
    name : projectName, 
    'public' : 'true', 
    'namespace_id' : groupId
  }));
  assertStatus(response, 'response.statusCode === 201');
  return response.body.id;
};

var addGroupMember = function*(request, groupId, userId) {
  var response = yield server.post(
    request(
      '/groups/' + groupId + '/members', 
      {'user_id': userId, 'access_level': 50}
    )
  );
  assertStatus(response, 'response.statusCode === 201');
};

var getUserMap = function*(request) {
  var response = yield server.get(request('/users'));
  var users = response.body;
  var userMap = {};
  for(var i = 0; i < users.length; i++) {
    userMap[users[i].username] = users[i].id;
  }
  return userMap;
};

var toUserIds = function*(request, usernames) {
  var userMap = yield getUserMap(request);
  var userIds = [];
  for(var i = 0; i < usernames.length; i++) {
    var name = usernames[i];
    var id = userMap[name];
    if(id) {
      userIds.push(id);
    } else {
      throw new Error('cannot find user : ' + name);
    }
  }
  return userIds;
};

var addGroupMembers = function*(request, groupId, members) {
  var memberIds = yield toUserIds(request, members);
  for(var i = 0; i < members.length; i++) {
    yield addGroupMember(request, groupId, memberIds[i]);
  }
};

var addDefaultMembers = function(users) {
  var members = [];
  for(var i = 0; i < users.length; i++) {
    members.push(users[i].uid);
  }
  return members;
};

var createIssue = function*(request, projectId, issue) {
  var response = 
    yield server.post(request('/projects/' + projectId + '/issues', {title : issue}));
  assertStatus(response, 'response.statusCode === 201');
};

var createIssues = function*(request, projectId, issues) {
  for(var i = 0; i < issues.length; i++) {
    yield createIssue(request, projectId, issues[i]);
  }
};

var setupProject = function*(request, options, groupId) {
  yield deleteProject(request, options.projectName);
  var projectId = yield createProject(request, options.projectName, groupId);

  if(options.issues) {
    yield createIssues(request, projectId, options.issues);
  }
};

var setupProjects = function*(request, projects, groupId) {
  for(var i = 0; i < projects.length; i++) {
    yield setupProject(request, projects[i], groupId);
  }
};

var deleteGroup = function*(request, groupName) {
  var response = yield server.get(request('/groups'));
  for(var i = 0; i < response.body.length; i++) {
    var body = response.body[i];
    if(body && body.name === groupName) {
      yield server.del(request('/groups/' + body.id));
    }
  }
};

var createGroup = function*(request, groupName) {
  var response = yield server.post(request('/groups', {name : groupName, path : groupName}));
  assertStatus(response, 'response.statusCode === 201');
  return response.body.id;
};

var setupGroup = function*(browser, url, options, users) {

  var key = yield getApiAccessKey(browser, url);
  var request = createRequest(url, key);

  yield deleteGroup(request, options.groupName);
  var groupId = yield createGroup(request, options.groupName);

  var members = options.members || addDefaultMembers(users);
  if(members) {
    yield addGroupMembers(request, groupId, members);
  }

  if(options.projects) {
    yield setupProjects(request, toArray(options.projects), groupId);
  }
};

var setupGroups = function*(browser, url, groups, users) {
  yield loginByAdmin(browser, url);

  for(var i = 0; i < groups.length; i++) {
    yield setupGroup(browser, url, groups[i], users);
  }

  yield logout(browser);
};

var addUsers = function*(browser, url, users) {
  for(var i = 0; i < users.length; i++) {
    yield login(browser, url, users[i].uid, users[i].userPassword);
    yield logout(browser);
  }
};

module.exports = {
  defaults: {
    url: 'http://server'
  },
  setup: function*(browser, options, ldapOptions) {
    var url = options.url || this.defaults.url;
    var users = toArray(options.users || ldapOptions.users);

    if(users) {
      yield addUsers(browser, url, users);
    }

    if(options.groups) {
      yield setupGroups(browser, url, toArray(options.groups), users);
    }
  }
};
