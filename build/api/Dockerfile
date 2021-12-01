FROM node:16.3.0-alpine

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json /opt/app
COPY yarn.lock /opt/app

RUN yarn --production
COPY . /opt/app

ENV REDIS_HOST redis
ENV PORT 3000
EXPOSE 3000

CMD ["yarn", "start"]
