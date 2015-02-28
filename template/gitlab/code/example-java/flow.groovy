node('java') {
  git url: 'http://server/example/example-java.git'
  sh 'bash ./build.sh'
  step([$class: 'JUnitResultArchiver', testResults: 'target/surefire-reports/*.xml'])
}
