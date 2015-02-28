#!/bin/bash
set -eux

assert()
{
    if [ `docker ps -a |grep $1 |wc -l` -gt 0 ]; then

        echo "ERROR: cannot clean"
        docker ps -a |grep $1
        exit 1
    fi
}

BASE_DIR=$(cd $(dirname $0); pwd)
TEMP_DIR=${BASE_DIR}/temp

if [ -d ${TEMP_DIR} ]; then
   cd ${TEMP_DIR}/pocci/bin
   echo 'y' | ./destroy-service
fi

assert poccis_
assert poccir_

if [ -d ${TEMP_DIR} ]; then
    rm -fr ${TEMP_DIR}
fi
