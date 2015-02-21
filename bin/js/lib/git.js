'use strict';
var spawn = require('co-child-process');
var path = require('path');
var urlparse = require('url').parse;
var urlformat = require('url').format;
var util = require('./util.js');

var toRemoteURL = function(url, user, remotePath) {
  var p = urlparse(url);
  if(!p.auth && user.userPassword) {
    p.auth = user.uid + ':' + user.userPassword;
  }
  p.pathname = remotePath;
  return urlformat(p);
};

var importCode = function*(url, options, ldapUsers) {
  var user = util.getUser(options.user, ldapUsers);
  var remoteUrl = toRemoteURL(url, user, options.remotePath);
  var shellScript = path.resolve(__dirname, 'git-import.sh');
  var args = [
    remoteUrl,
    options.localPath,
    user.uid,
    user.mail,
    options.commitMessage
  ];

  yield spawn(shellScript, args, {stdio: 'inherit'});
};

module.exports = {
  defaults: {
    url: 'http://server',
  },
  import: function*(options, ldapOptions) {
    var url = options.url || this.defaults.url;
    var repos = util.toArray(options.repositories);

    for(var i = 0; i < repos.length; i++) {
      yield importCode(url, repos[i], ldapOptions.users);
    }
  }
};
