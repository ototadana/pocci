'use strict';
/*global describe, it*/
var assert = require('chai').assert;
var hello = require('./index.js');

describe('index.js', function() {
  it('says hello to Shoichi', function() {
    assert('hello, Shoichi', hello('Shoichi'));
  });
});
