node('java') {
  git url: 'http://server/git/example.example-java'
  sh 'mvn -B clean install'
  step([$class: 'JUnitResultArchiver', testResults: 'target/surefire-reports/*.xml'])
}
