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

if [ `docker ps |grep "pocci[s|n|r]_" |wc -l` -gt 0 ]; then
    `docker ps |grep "pocci[s|n|r]_" |awk 'BEGIN{printf "docker stop "}{printf $1" "}'`
fi
if [ `docker ps -a |grep "pocci[s|n|r]_" |wc -l` -gt 0 ]; then
    `docker ps -a |grep "pocci[s|n|r]_" |awk 'BEGIN{printf "docker rm "}{printf $1" "}'`
fi

if [ -d ${TEMP_DIR} ]; then
    rm -fr ${TEMP_DIR}
fi

assert poccis_
assert poccin_
assert poccir_
