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
    reporters: ['progress', 'junit'],
    junitReporter: {
      outputFile: 'test-results/result.xml'
    },
    basePath: '.',
    files: ['indexTest.js', 'index.js', 'bower_components/jquery/dist/jquery.js']
  });
};
