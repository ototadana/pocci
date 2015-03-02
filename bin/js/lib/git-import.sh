#!/bin/bash
set -eux

if [ $# -ne 5 ]; then
  echo Invalid arguments "$@"
  exit 1
fi

REMOTE_PATH=$1
LOCAL_PATH=$2
USER_NAME=$3
USER_EMAIL=$4
COMMIT_MESSAGE=$5

rm -fr /tmp/${LOCAL_PATH}
git clone ${REMOTE_PATH} /tmp/${LOCAL_PATH}

cp -r ${LOCAL_PATH}/. /tmp/${LOCAL_PATH}
cd /tmp/${LOCAL_PATH}
git config user.name ${USER_NAME}
git config user.email ${USER_EMAIL}
git add --all
git commit -m "${COMMIT_MESSAGE}"
git push origin master
