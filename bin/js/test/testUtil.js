'use strict';
var assert = require('chai').assert;
var path = require('path');
var server = require('co-request');
var yaml = require('../lib/yaml.js');

var assertResource = function*(request, name, spec) {
  console.log('\n' + name + ':' + spec.path);
  var body = (yield server.get(request(spec.path))).body;
  console.log(JSON.stringify(body, null, '  '));

  if(spec.edit) {
    spec.edit(body);
  }

  for(var i = 0; i < spec.values.length; i++) {
    console.log('assert: ' + spec.values[i][0] + ' === ' + spec.values[i][1]);
    if(spec.values[i][1] === 'undefined') {
      assert.notDeepProperty(body, spec.values[i][0]);
    } else {
      assert.deepPropertyVal(body, spec.values[i][0], spec.values[i][1]);
    }
  }
};

module.exports = {
  assertResources: function*(request, specs, edit) {
    if(typeof specs === 'string') {
      specs = yaml(path.resolve(__dirname, specs));
    }

    if(edit) {
      edit(specs);
    }

    var keys = Object.keys(specs);
    for(var i = 0; i < keys.length; i++) {
      yield assertResource(request, keys[i], specs[keys[i]]);
    }
  }
};
