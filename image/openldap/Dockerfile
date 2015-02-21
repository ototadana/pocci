FROM osixia/openldap:0.9.1
MAINTAINER ototadana@gmail.com

RUN sed -i 's|^exec /usr/sbin/slapd -h "ldap:///" -u openldap -g openldap|exec /usr/sbin/slapd -h "ldap:///" -u openldap -g openldap -d -1|g' /etc/service/slapd/run

