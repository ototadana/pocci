FROM ototadana/jenkins-slave-base
MAINTAINER ototadana@gmail.com

ENV NVM_VERSION v0.24.0
RUN sudo wget -qO- https://raw.githubusercontent.com/creationix/nvm/${NVM_VERSION}/install.sh | bash

RUN source ~/.nvm/nvm.sh \
    && nvm install stable \
    && npm install -g bower grunt-cli yo

COPY ./config/. /config/
RUN sudo chown -R jenkins:jenkins /config
RUN chmod +x /config/*

ENV NODE_NAME nodejs
