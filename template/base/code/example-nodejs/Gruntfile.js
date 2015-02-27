'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    karma: {
      singleRun: {
        options: {
          configFile: 'karma.conf.js',
          singleRun: true
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['karma:singleRun']);
};
