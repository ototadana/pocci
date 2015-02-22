'use strict';
var requestretry = require('requestretry');
var assertStatus = require('./util.js').assertStatus;

module.exports = function(url) {
  var handleResponse = function(err, response) {
    if(err) {
      throw err;
    }
    assertStatus(response, 'response.statusCode === 200');
    console.log('  OK: ' + response.request.href);
  };

  console.log('Waiting for');
  console.log('  ' + url.join(', '));
  for(var i = 0; i < url.length; i++) {
    requestretry({
      url: url[i],
      json:false,
      maxAttempts:1200,
      retryDelay: 1000,
      retryStrategy: requestretry.RetryStrategies.HTTPOrNetworkError
    }, handleResponse);
  }
};
