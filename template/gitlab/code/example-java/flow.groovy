node('java') {
  git url: 'http://server/example/example-java.git'
  sh 'mvn -B clean install'
  step([$class: 'JUnitResultArchiver', testResults: 'target/surefire-reports/*.xml'])
}
