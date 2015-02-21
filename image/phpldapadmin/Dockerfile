FROM osixia/phpldapadmin:0.4.1
MAINTAINER ototadana@gmail.com

RUN sed -i 's|--ssl --ssl-crt=/etc/nginx/ssl/$PHPLDAPADMIN_SSL_CRT_FILENAME --ssl-key=/etc/nginx/ssl/$PHPLDAPADMIN_SSL_KEY_FILENAME||g' /etc/my_init.d/phpldapadmin.sh

