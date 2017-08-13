FROM node:8.3.0-alpine

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json /opt/app/
RUN npm install --production
COPY . /opt/app

ENV PORT 3000
EXPOSE 3000
CMD ["npm", "start"]
