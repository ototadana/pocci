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
    rm -fr ${TEMP_DIR}
else
    if [ `docker ps |grep "pocci[s|r]_" |wc -l` -gt 0 ]; then
        `docker ps |grep "pocci[s|r]_" |awk 'BEGIN{printf "docker stop "}{printf $1" "}'`
    fi
    if [ `docker ps -a |grep "pocci[s|r]_" |wc -l` -gt 0 ]; then
        `docker ps -a |grep "pocci[s|r]_" |awk 'BEGIN{printf "docker rm "}{printf $1" "}'`
    fi
fi

assert poccis_
assert poccir_
