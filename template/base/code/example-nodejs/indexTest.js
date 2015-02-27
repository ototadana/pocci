'use strict';
/*global describe, it*/
var assert = chai.assert;

describe('index.js', function() {
  it('says hello to Shoichi', function() {
    assert.equal('hello, Shoichi', hello('Shoichi '));
  });
});
