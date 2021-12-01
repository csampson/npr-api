FROM redislabs/redisearch:2.2.5

SHELL ["/bin/bash", "-c"]

RUN mkdir /opt/db
WORKDIR /opt/db
COPY . /opt/db

RUN apt-get update -qq -y
RUN apt-get install -qq curl -y

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
RUN cat ~/.bashrc

# Pre-load with static station data
RUN source ~/.bashrc \
    && redis-server --loadmodule /usr/lib/redis/modules/redisearch.so --daemonize yes \
    && nvm install \
    && npm install -g yarn \
    && yarn \
    && yarn run stations:load
