FROM ototadana/jenkins-slave-base
MAINTAINER ototadana@gmail.com

ENV MVN_VERSION 3.2.5

RUN wget http://www.us.apache.org/dist/maven/maven-3/${MVN_VERSION}/binaries/apache-maven-${MVN_VERSION}-bin.zip -P /tmp \
    && unzip /tmp/apache-maven-${MVN_VERSION}-bin.zip -d /opt \
    && rm -f /tmp/apache-maven-${MVN_VERSION}-bin.zip

RUN echo 'export M2_HOME=/opt/apache-maven-${MVN_VERSION}' >/etc/profile.d/maven.sh \
    && echo 'export M2=$M2_HOME/bin' >>/etc/profile.d/maven.sh \
    && echo 'export PATH=$M2:$PATH' >>/etc/profile.d/maven.sh

COPY ./config/. /config/
RUN chmod +x /config/*

VOLUME ["/root/.m2"]

ENV NODE_NAME java
