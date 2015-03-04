#!/bin/bash
set -eu

BUILD_OPTS="-Dmaven.test.failure.ignore=true"

mvn -B ${BUILD_OPTS} clean org.jacoco:jacoco-maven-plugin:prepare-agent install sonar:sonar
