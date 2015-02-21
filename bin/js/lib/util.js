/*jslint evil: true */
'use strict';
var assert = require('assert');

module.exports = {
  toArray: function(obj){
    if(Array.isArray(obj)) {
      return obj;
    }

    if(obj) {
      return [obj];
    }
    
    return [];
  },
  getUser: function(user, ldapUsers) {
    var defaultUser = {
      uid: 'anonymous',
      userPassword: '',
      mail: 'anonymous@example.com'
    };

    if(typeof user === 'object') {
      return user;
    }

    if(!Array.isArray(ldapUsers) && typeof ldapUsers === 'object') {
      return ldapUsers;
    }

    if(!Array.isArray(ldapUsers) || ldapUsers.length === 0) {
      return defaultUser;
    }

    for(var i = 0; i < ldapUsers.length; i++) {
      if(user === ldapUsers[i].uid) {
        return ldapUsers[i];
      }
    }

    return ldapUsers[0];
  },
  assertStatus: function(response, condition) {
    if(eval(condition)) {
      return;
    }

    console.log('== == == == == == == == == == ');
    console.log(response);
    console.log('== == == == == == == == == == ');
    
    var message = '\n  Unexpected status:' +
                  '\n    expected: ' + condition +
                  '\n    actual:   response.statusCode === ' + response.statusCode +
                  '\n    message:  ' + response.statusMessage +
                  '\n      href:     ' + response.request.href +
                  '\n      method:   ' + response.request.method +
                  '\n      body:     ' + JSON.stringify(response.request.body) +
                  '\n      headers:  ' + JSON.stringify(response.request.headers);
                  
    assert(false, message);
  },
};
