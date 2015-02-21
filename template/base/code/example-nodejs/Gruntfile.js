'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    env: {
      test: {
        XUNIT_FILE: 'test-results/result.xml'
      },
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'xunit-file',
          require: 'xunit-file'
        },
        src: ['indexTest.js']
      },
    }
  });
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.registerTask('make-test-results', function(){
    require('fs').mkdir('test-results');
  });

  grunt.registerTask('default', [
    'make-test-results', 'env:test', 'mochaTest:test'
  ]);
};
