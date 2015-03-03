'use strict';
var fs = require('fs');
var yaml = require('js-yaml');

module.exports = function(yamlFile) {
  var yamlText = fs.readFileSync(yamlFile, 'utf8');
  return yaml.safeLoad(yamlText);
};
