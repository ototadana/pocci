#!/bin/bash
set -eux

POCCI_REPO=$1
TEMPLATE_NO=$2

BASE_DIR=$(cd $(dirname $0); pwd)

${BASE_DIR}/do-instructions-in-readme.sh ${POCCI_REPO} ${TEMPLATE_NO}

cd ${BASE_DIR}/temp/pocci/bin/js

if [ "${TEMPLATE_NO}" -eq 1 ]; then
   PORTAL_TEST=gitlab
else
   PORTAL_TEST=alminium
fi

sudo rm -fr ${BASE_DIR}/temp/pocci/backup/*
${BASE_DIR}/temp/pocci/bin/backup
POCCIR_OPTS_ADD="-e TEMPLATE_NO=${TEMPLATE_NO}" ../oneoff iojs grunt smokeTest ${PORTAL_TEST}
echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup/*
POCCIR_OPTS_ADD="-e TEMPLATE_NO=${TEMPLATE_NO}" ../oneoff iojs grunt smokeTest ${PORTAL_TEST}
