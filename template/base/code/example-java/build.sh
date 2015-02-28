#!/bin/bash
set -eu

BUILD_OPTS="-Dsonar.jdbc.username=${SONARDB_ENV_DB_USER} \
            -Dsonar.jdbc.password=${SONARDB_ENV_DB_PASS} \
            -Dsonar.jdbc.url=jdbc:postgresql://sonardb/${SONARDB_ENV_DB_NAME} \
            -Dsonar.host.url=http://sonar:9000/sonar \
            -Dmaven.test.failure.ignore=true"

mvn -B ${BUILD_OPTS} clean org.jacoco:jacoco-maven-plugin:prepare-agent install sonar:sonar
