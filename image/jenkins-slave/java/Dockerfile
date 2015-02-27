FROM ototadana/jenkins-slave-base
MAINTAINER ototadana@gmail.com

ENV MVN_VERSION 3.2.5

RUN wget http://www.us.apache.org/dist/maven/maven-3/${MVN_VERSION}/binaries/apache-maven-${MVN_VERSION}-bin.zip -P /tmp \
    && unzip /tmp/apache-maven-${MVN_VERSION}-bin.zip -d ~ \
    && rm -f /tmp/apache-maven-${MVN_VERSION}-bin.zip

ENV M2_HOME ${JENKINS_HOME}/apache-maven-${MVN_VERSION}
ENV M2 ${M2_HOME}/bin
ENV PATH ${M2}:${PATH}

COPY ./config/. /config/
RUN sudo chown -R jenkins:jenkins /config
RUN chmod +x /config/*

ENV NODE_NAME java
