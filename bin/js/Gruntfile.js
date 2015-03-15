'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    coffee: {
      lib: {
        expand: true,
        cwd: 'lib',
        src: ['*.coffee'],
        dest: 'lib',
        ext: '.js'
      },
      test: {
        expand: true,
        cwd: 'test',
        src: ['*.coffee'],
        dest: 'test',
        ext: '.js'
      },
    },
    jshint: {
      all: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['Gruntfile.js', 'app.js', 'lib/**/*.js', 'test/**/*.js']
      }
    },
    clean: ['config'],
    mochaTest: {
      all: {
        src: ['test/*.js']
      },
      ldap: {
        src: ['test/ldapTest.js']
      },
      alminium: {
        src: ['test/alminiumTest.js']
      },
      gitlab: {
        src: ['test/gitlabTest.js']
      },
      jenkins: {
        src: ['test/jenkinsTest.js']
      },
      git: {
        src: ['test/gitTest.js']
      },
      smokeTest: {
        src: ['test/smokeTest.js']
      },
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.registerTask('mkdir',
    function() {
      require('fs').mkdir('config');
    }
  );

  grunt.registerTask('basic', ['coffee', 'jshint', 'clean', 'mkdir']);
  grunt.registerTask('default', ['basic']);
  grunt.registerTask('smokeTest', ['basic', 'mochaTest:smokeTest']);
  grunt.registerTask('ldap', ['basic', 'mochaTest:ldap']);
  grunt.registerTask('alminium', ['basic', 'mochaTest:alminium']);
  grunt.registerTask('gitlab', ['basic', 'mochaTest:gitlab']);
  grunt.registerTask('jenkins', ['basic', 'mochaTest:jenkins']);
  grunt.registerTask('git', ['basic', 'mochaTest:git']);
};
