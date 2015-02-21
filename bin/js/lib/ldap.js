'use strict';
var ldap = require('ldapjs');
var thunkify = require('thunkify');
var ssha = require('ssha');
var toArray = require('./util.js').toArray;

var addUsers = function*(client, users, baseDn) {
  var add = thunkify(client.add.bind(client));
  var del = thunkify(client.del.bind(client));

  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    var plainPassword = user.userPassword;
    user.cn = user.uid;
    user.userPassword = ssha.create(plainPassword);
    user.objectclass = ['inetOrgPerson', 'top'];
    var dn = 'cn=' + user.cn + ',' + baseDn;
    try {
      yield del(dn);
    } catch(err) {
      if(err.name === 'NoSuchObjectError') {
        console.log('  DELETE: ' + err.message + ' : ' + dn);
      } else {
        throw err;
      }
    }
    yield add(dn, user);
    user.userPassword = plainPassword;
  }
};

var delUsers = function*(client, users, baseDn) {
  var del = thunkify(client.del.bind(client));

  for(var i = 0; i < users.length; i++) {
    var dn = 'cn=' + users[i].uid + ',' + baseDn;
    try {
      yield del(dn);
    } catch(err) {
        // ignore
        // console.log('  DELETE: ' + err.message + ' : ' + dn);
    }
  }
};

module.exports = {
  defaults: {
    url:            'ldap://ldap',
    organisation:   'Example Inc.',
    domain:         'example.com',
    bindDn:         'cn=admin,dc=example,dc=com',
    bindPassword:   'admin',
    baseDn:         'dc=example,dc=com',
    attrLogin:      'uid',
    attrFirstName:  'givenName',
    attrLastName:   'sn',
    attrMail:       'mail'
  },
  bind: function*(options) {
    var url = options.url || this.defaults.url;
    var bindDn = options.bindDn || this.defaults.bindDn;
    var bindPassword = options.bindPassword || this.defaults.bindPassword;
    var client = ldap.createClient({url: url});
    var bind = thunkify(client.bind.bind(client));
    yield bind(bindDn, bindPassword);
    return client;
  },
  del: function*(options) {
    if(!options.readOnly && options.users) {
      var baseDn = options.baseDn || this.defaults.baseDn;
      var client = yield this.bind(options);
      yield delUsers(client, toArray(options.users), baseDn);
    }
  },
  add: function*(options) {
    if(!options.readOnly && options.users) {
      var baseDn = options.baseDn || this.defaults.baseDn;
      var client = yield this.bind(options);
      yield addUsers(client, toArray(options.users), baseDn);
    }
  }
};
