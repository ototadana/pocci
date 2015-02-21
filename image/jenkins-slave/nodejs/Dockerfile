FROM ototadana/jenkins-slave-base
MAINTAINER ototadana@gmail.com

ENV NVM_VERSION v0.23.3
RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/${NVM_VERSION}/install.sh | NVM_DIR=/usr/local/nvm bash

RUN . /usr/local/nvm/nvm.sh \
    && nvm install stable \
    && npm install -g bower grunt-cli yo

RUN chmod g+rwx /root

COPY ./config/. /config/
RUN chmod +x /config/*

ENV NODE_NAME nodejs
