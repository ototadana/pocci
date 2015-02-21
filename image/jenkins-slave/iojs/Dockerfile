FROM ototadana/jenkins-slave-nodejs
MAINTAINER ototadana@gmail.com

RUN . /usr/local/nvm/nvm.sh \
    && nvm install iojs \
    && npm install -g bower grunt-cli yo

COPY ./config/. /config/
RUN chmod +x /config/*

ENV NODE_NAME iojs
