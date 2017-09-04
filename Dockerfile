FROM nginx
MAINTAINER uupaa

COPY conf/wm2-nginx.conf  /etc/nginx/nginx.conf
COPY conf/wm2-server.crt  /etc/nginx/wm2-server.crt
COPY conf/wm2-server.key  /etc/nginx/wm2-server.key

EXPOSE 443
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

