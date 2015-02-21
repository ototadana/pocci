#!/bin/bash
set -e

if [ ! -f slave.jar ]; then
    wget ${JENKINS_URL}/jnlpJars/slave.jar
fi

java -jar slave.jar -jnlpUrl ${JENKINS_URL}/computer/${NODE_NAME}/slave-agent.jnlp ${JENKINS_SLAVE_SECRET}
