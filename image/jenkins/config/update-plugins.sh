#!/bin/bash
set -e

JENKINS_URL=$1

rm -fr /var/jenkins_home/war/WEB-INF/plugins/*
rm -fr /var/jenkins_home/plugins/*.jpi

cp /config/plugins/* /var/jenkins_home/war/WEB-INF/plugins/
