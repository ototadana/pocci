#!/bin/bash
set -eux

BASE_DIR=$(cd $(dirname $0); pwd)

${BASE_DIR}/clean-containers.sh
${BASE_DIR}/remove-images.sh
${BASE_DIR}/smoke-test.sh https://github.com/ototadana/pocci.git 1

${BASE_DIR}/clean-containers.sh
${BASE_DIR}/smoke-test.sh https://github.com/ototadana/pocci.git 2
