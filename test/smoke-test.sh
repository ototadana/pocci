#!/bin/bash
set -eux

POCCI_REPO=$1
TEMPLATE_NO=$2

BASE_DIR=$(cd $(dirname $0); pwd)

${BASE_DIR}/do-instructions-in-readme.sh ${POCCI_REPO} ${TEMPLATE_NO}

cd ${BASE_DIR}/temp/pocci/bin/js
${BASE_DIR}/../bin/oneoff -e TEMPLATE_NO=${TEMPLATE_NO} iojs grunt smokeTest
