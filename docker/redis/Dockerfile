FROM redislabs/redisearch:1.0.8

COPY redis.conf /etc/redis.conf
VOLUME ["/var/run/redis"]

CMD redis-server /etc/redis.conf --loadmodule /usr/lib/redis/modules/redisearch.so
