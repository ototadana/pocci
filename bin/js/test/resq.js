'use strict';
var assert = require('chai').assert;
var cheerio = require('cheerio');
var getPathValue = require('chai/lib/chai/utils/getPathValue');
var path = require('path');
var server = require('co-request');
var yaml = require('../lib/yaml.js');
var assertStatus = require('../lib/util.js').assertStatus;
var toArray = require('../lib/util.js').toArray;

var toKeyword = function(key) {
  return '${' + key + '}';
};

var getJsonValue = function(path, response, del) {
  if(typeof response.body === 'string') {
    response.body = JSON.parse(response.body);
  }
  if(!del) {
    assert.deepProperty(response, path);
  }
  return getPathValue(path, response);
};

var getHtmlValue = function(path, response, del) {
  if(!del) {
    assertStatus(response, 'response.statusCode < 300');
  }

  var $ = cheerio.load(response.body);
  return $(path).first().text();
};

var getValue = function*(request, address, del) {
  var path = address.split('@');
  var response = (yield server.get(request(path[1])));
  var contentType = response.headers['content-type'];
  console.log(JSON.stringify(response, null, '  '));
  if(!path[0]) {
    return response;
  }

  if(contentType === 'application/json') {
    return getJsonValue(path[0], response, del);
  }

  return getHtmlValue(path[0], response, del);
};

var getVariables = function*(request, specVariables, variables, del) {
  if(!variables) {
    variables = {};
  }

  if(!specVariables) {
    return variables;
  }

  var keys = Object.keys(specVariables);
  for(var i = 0; i < keys.length; i++) {
    var name = keys[i];
    console.log('    ' + name + ' : ' + specVariables[name]);
    variables[name] = yield getValue(request, specVariables[name], del);
  }
  return variables;
};

var replaceValues = function(values, keyword, replacement) {
  if(!values) {
    return;
  }

  var newValues = {};
  var keys = Object.keys(values);
  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = values[key];
    var newKey = key.replace(keyword, value);
    newValues[newKey] = (typeof value === 'string')? value.replace(keyword, replacement) : value;
  }
  return newValues;
};

var replace = function(variables, spec) {
  var keys = Object.keys(variables);
  for(var i = 0; i < keys.length; i++) {
    var keyword = toKeyword(keys[i]);
    var value = variables[keys[i]];
    spec.path = spec.path.replace(keyword, value);
    spec.values = replaceValues(spec.values, keyword, value);
  }
};

var updateSpec = function*(request, spec, del) {
  var variables = (yield getVariables(request, spec.get, spec.variables, del));
  replace(variables, spec);
};

var updateAddress = function*(request, address, variables, del) {
  var spec = {
    get: variables,
    path: address
  };
  yield updateSpec(request, spec, del);
  return spec.path;
};

var deleteResource = function*(request, address, variables) {
  if(variables) {
    address = yield updateAddress(request, address, variables, true);
  }
  var response = (yield server.del(request(address)));
  assertStatus(response, 'response.statusCode < 300 || response.statusCode === 404');
};

var postResource = function*(request, address, body) {
  var response = yield server.post(request(address, body));
  assertStatus(response, 'response.statusCode < 300');
};

var putResource = function*(request, address, body, variables) {
  if(variables) {
    address = yield updateAddress(request, address, variables);
  }
  var response = yield server.put(request(address, body));
  assertStatus(response, 'response.statusCode < 300');
};

var sort = function(response, sortOptions) {
  var sortBy = function(keys, target) {
    target.sort(function(a, b) {
      for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var valueA = getPathValue(key, a);
        var valueB = getPathValue(key, b);
        if(valueA > valueB) {
          return 1;
        } else if(valueA < valueB) {
          return -1;
        }
      }
      return 0;
    });
  };

  for(var i = 0; i < sortOptions.length; i++) {
    var sortOption = sortOptions[i];
    var keys = toArray(sortOption.keys);
    var target = getPathValue(sortOption.target, response);
    sortBy(keys, target);
  }
};

var assertResource = function*(request, name, spec) {
  console.log('\n' + name + ':');
  yield updateSpec(request, spec);

  console.log('    ' + spec.path);
  spec.response = (yield server.get(request(spec.path)));
  console.log(JSON.stringify(spec.response, null, '  '));

  if(spec.sort) {
    sort(spec.response, toArray(spec.sort));
  }

  var keys = Object.keys(spec.values);
  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = spec.values[key];
    console.log('assert: ' + key + ' === ' + value);
    if(value === 'undefined') {
      assert.notDeepProperty(spec.response, key);
    } else {
      var pathValue = getPathValue(key, spec.response);
      assert.equal(pathValue, value);
    }
  }
};

var readSpecs = function(fileName) {
  return yaml(path.resolve(__dirname, fileName));
};

var assertResources = function*(request, specs) {
  if(typeof specs === 'string') {
    specs = readSpecs(specs);
  }

  var keys = Object.keys(specs);
  for(var i = 0; i < keys.length; i++) {
    yield assertResource(request, keys[i], specs[keys[i]]);
  }
};


module.exports = function(request) {

  var del = function*(address, variables) {
    yield deleteResource(request, address, variables);
  };
  var post = function*(address, body) {
    yield postResource(request, address, body);
  };
  var put = function*(address, body, variables) {
    yield putResource(request, address, body, variables);
  };

  return {
    readSpecs: readSpecs,
    assert: function*(specs) {
      yield assertResources(request, specs);
    },
    get: function*(address) {
      return yield getValue(request, address);
    },
    del: del,
    post: post,
    put: put,
    remove: del,
    create: post,
    update: put
  };
};
