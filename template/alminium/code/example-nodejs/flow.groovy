node('nodejs') {
  git url: 'http://server/git/example.example-nodejs'
  sh 'bash ./build.sh'
  step([$class: 'JUnitResultArchiver', testResults: 'test-results/*.xml'])
}
