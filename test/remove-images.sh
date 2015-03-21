#!/bin/bash
set -eux

remove()
{
    if [ `docker images | grep $1 | wc -l` -gt 0 ]; then
      docker rmi $1
    fi
}

remove ototadana/alminium
remove ototadana/jenkins-slave-iojs
remove ototadana/jenkins-slave-nodejs
remove ototadana/jenkins-slave-java
remove ototadana/jenkins-slave-base
remove ototadana/jenkins
remove ototadana/openldap
remove ototadana/phpldapadmin
remove ototadana/sonarqube
