FROM redislabs/redisearch:2.0.0

COPY redis.conf /etc/redis.conf
VOLUME ["/var/run/redis"]

CMD redis-server /etc/redis.conf --loadmodule /usr/lib/redis/modules/redisearch.so
