'use strict';
var co = require('co');
var setup = require('./lib/setup.js');

co(function*() {
  yield setup('./config/setup.yml');
  process.exit(0);
}).catch(function(err) {
  console.error(err);
  process.exit(1);
});
