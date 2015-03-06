'use strict';
var spawn = require('co-child-process');
var path = require('path');
var util = require('./util.js');

var importCode = function*(url, options, ldapUsers) {
  var user = util.getUser(options.user, ldapUsers);
  var remoteUrl = util.getURL(url, user, options.remotePath);
  var shellScript = path.resolve(__dirname, 'git-import.sh');
  var args = [
    shellScript,
    remoteUrl,
    options.localPath,
    user.uid,
    user.mail,
    options.commitMessage
  ];

  yield spawn('/bin/bash', args, {stdio: 'inherit'});
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
