FROM jenkins:weekly
MAINTAINER ototadana@gmail.com

USER root

RUN apt-get update \
    && apt-get install -y sudo \
    && rm -rf /var/lib/apt/lists/*

RUN echo "jenkins ALL=(ALL) NOPASSWD:ALL" >>/etc/sudoers

COPY ./config/. /config/
RUN mkdir /config/plugins
RUN chown -R jenkins:jenkins /config
RUN chmod +x /config/*

USER jenkins
RUN jar tf /usr/share/jenkins/jenkins.war WEB-INF/plugins \
       | grep hpi \
       | sed -e 's|WEB-INF/plugins|wget http://updates.jenkins-ci.org/latest|' \
       | sed -e 's|\.hpi$|.hpi -P /config/plugins|' >/config/download-latest-plugins.sh \
    && bash /config/download-latest-plugins.sh

# downgrade matrix-project (1.4 -> 1.4.1)
RUN rm /config/plugins/matrix-project.hpi \
    && wget http://updates.jenkins-ci.org/download/plugins/matrix-project/1.4/matrix-project.hpi -P /config/plugins

RUN /usr/local/bin/plugins.sh /config/plugins.txt

ENTRYPOINT ["/config/entrypoint"]
CMD ["/usr/local/bin/jenkins.sh"]
