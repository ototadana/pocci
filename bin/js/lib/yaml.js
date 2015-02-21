/* jslint evil: true */
'use strict';
var fs = require('fs');
var yaml = require('yaml');

module.exports = function(yamlFile) {
  var yamlText = fs.readFileSync(yamlFile, 'utf8');
  return yaml.eval(yamlText);
};
