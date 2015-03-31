FROM java:openjdk-8-jdk
MAINTAINER ototadana@gmail.com

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && echo "deb http://packages.linuxmint.com debian import " > /etc/apt/sources.list.d/firefox.list \
    && apt-get update \
    && apt-get install -y --force-yes firefox google-chrome-stable make sudo vim xvfb \
    && rm -rf /var/lib/apt/lists/*

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV JENKINS_HOME /var/jenkins_home

RUN useradd -d ${JENKINS_HOME} -u 1000 -m -s /bin/bash jenkins
RUN mkdir -p /app && chown jenkins:jenkins /app
RUN echo "jenkins ALL=(ALL) NOPASSWD:ALL" >>/etc/sudoers

COPY ./config/. /config/
RUN chown -R jenkins:jenkins /config
RUN chmod +x /config/*

USER jenkins
WORKDIR /tmp

ENTRYPOINT ["/config/entrypoint"]
CMD ["/config/startJenkinsSlave.sh"]

ENV DISPLAY :99
ENV SCREEN_WxHxD 1024x768x24
ENV JENKINS_URL http://jenkins:8080/jenkins
ENV NODE_NAME node1
