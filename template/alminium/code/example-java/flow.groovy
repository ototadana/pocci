node('java') {
  git url: 'http://server/git/example.example-java'
  sh 'bash ./build.sh'
  step([$class: 'JUnitResultArchiver', testResults: 'target/surefire-reports/*.xml'])
}
