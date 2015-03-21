FROM centos:centos6
MAINTAINER ototadana@gmail.com

RUN yum install -y git tar which

WORKDIR /
RUN git clone https://github.com/alminium/alminium.git

WORKDIR /alminium

RUN sed -i "s/redmine_code_review,default/redmine_code_review,0.6.5/g" /alminium/config/redmine-plugins.lst \
    && sed -i "s,PASSENGER_VERSION=.*$,PASSENGER_VERSION=\$(echo \`passenger-config --version\` |sed -e 's/Phusion Passenger //g'),g" /alminium/inst-script/rhel6/post-install

RUN export ALM_HOSTNAME="localhost" \
    && export SSL="N" \
    && export ENABLE_JENKINS="n" \
    && bash -l -c ./smelt

RUN wget http://www.torutk.com/attachments/download/226/perl-Authen-Simple-LDAP-0.3-1.el6.noarch.rpm \
    && yum install -y perl-LDAP perl-Params-Validate \
       perl-Module-Runtime perl-Module-Implementation perl-Class-Accessor \
       perl-Class-Data-Inheritable perl-Crypt-PasswordMD5 perl-Test-Simple \
    && yum --enablerepo=epel-testing install -y perl-Authen-Simple \
    && rpm -ivh perl-Authen-Simple-LDAP-0.3-1.el6.noarch.rpm

RUN echo PerlLoadModule Authen::Simple::LDAP >>/etc/httpd/conf.d/vcs.conf

COPY ./config/. /config/
RUN chmod +x /config/*

VOLUME ["/opt/alminium", "/var/opt/alminium", "/var/lib/mysql"]
EXPOSE 80 3306

ENTRYPOINT ["/config/entrypoint"]
CMD ["/config/command"]
