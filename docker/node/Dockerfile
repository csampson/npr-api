FROM node:14.10.1-alpine

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json /opt/app/
RUN yarn --production
COPY . /opt/app

ENV PORT 3000
EXPOSE 3000
CMD ["npm", "start"]
