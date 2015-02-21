'use strict';
var yaml = require('./yaml.js');
var ldapDefaults = require('./ldap.js').defaults;

module.exports = function(yamlFile) {
  var options = yaml(yamlFile);

  if(!options.ldap) {
    options.ldap = {};
  }

  var domain = options.ldap.domain || ldapDefaults.domain;
  var organisation = options.ldap.organisation || ldapDefaults.organisation;
  var bindDn = options.ldap.bindDn || ldapDefaults.bindDn;
  var bindPassword = options.ldap.bindPassword || ldapDefaults.bindPassword;
  var baseDn = options.ldap.baseDn || ldapDefaults.baseDn;

  console.log('LDAP_DOMAIN=' + domain);
  console.log('LDAP_ORGANISATION=' + organisation);
  console.log('LDAP_LOGIN_DN=' + bindDn);
  console.log('LDAP_BIND_DN=' + bindDn);
  console.log('LDAP_BIND_PASSWORD=' + bindPassword);
  console.log('LDAP_ADMIN_PWD=' + bindPassword);
  console.log('LDAP_PASS=' + bindPassword);
  console.log('LDAP_BASE_DN=' + baseDn);
  console.log('LDAP_BASE=' + baseDn);

  if(options.environment) {
    for(var i = 0; i < options.environment.length; i++) {
      console.log(options.environment[i]);
    }
  }

};
