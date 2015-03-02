module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    customLaunchers: {
      Chrome_NS: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    browsers: ['Chrome_NS'],
    reporters: ['progress', 'coverage', 'junit'],
    preprocessors: {
      'app/*.js': ['coverage']
    },
    junitReporter: {
      outputFile: 'test-results/result.xml'
    },
    coverageReporter: {
      reporters : [
        {type: 'lcov', subdir: '.'}
      ],
      dir : 'coverage'
    },
    basePath: '.',
    files: [
      'test/*.js', 'app/*.js',
      {pattern: 'bower_components/jquery/dist/jquery.js', watch: false}
    ]
  });
};
