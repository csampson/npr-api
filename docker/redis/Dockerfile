FROM alpine:3.6

RUN apk add --update redis=3.2.8-r0
COPY redis.conf /etc/redis.conf
VOLUME ["/var/run/redis"]

CMD redis-server /etc/redis.conf
