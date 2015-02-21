/*global document*/
'use strict';
var webdriver = require('webdriverio');
var selenium = require('selenium-standalone');
var thunkify = require('thunkify');

module.exports.init = function*() {
  yield thunkify(selenium.start.bind(selenium))({spawnOptions: {stdio: 'inherit'}});
  var browser = webdriver.remote({desiredCapabilities:{browserName:'chrome'}}).init();
  browser.yieldable = {
    call: thunkify(browser.call.bind(browser)),
    click: function*(selector) {
      yield browser.execute(
        function(selector) {
          document.querySelector(selector).click();
        }, selector);
    },
    end: thunkify(browser.end.bind(browser)),
    getHTML: thunkify(browser.getHTML.bind(browser)),
    getText: thunkify(browser.getText.bind(browser)),
    getValue: thunkify(browser.getValue.bind(browser)),
    isSelected: thunkify(browser.isSelected.bind(browser))
  };
  browser.windowHandleMaximize();
  module.exports.browser = browser;
};
