# Public Radio Tuner API

[![Build Status](https://travis-ci.org/openbroadcasting/api.svg?branch=master)](https://travis-ci.org/openbroadcasting/api)
[![Coverage Status](https://coveralls.io/repos/github/openbroadcasting/api/badge.svg?branch=master)](https://coveralls.io/github/openbroadcasting/api?branch=master)
[![bitHound Overall Score](https://www.bithound.io/github/openbroadcasting/api/badges/score.svg)](https://www.bithound.io/github/openbroadcasting/api)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/a66c9fc83d5c8395bd22#?env%5Bproduction%5D=W3sidHlwZSI6InRleHQiLCJlbmFibGVkIjp0cnVlLCJrZXkiOiJwYmlfZW5kcG9pbnQiLCJ2YWx1ZSI6Imh0dHA6Ly9wdWJsaWMtcmFkaW8tYXBpLmhlcm9rdWFwcC5jb20ifV0=)

This a REST api for querying information about [NPR](http://npr.org) member stations. It features filtering, geolocation searching, pagination, and sorting.

## Requirements

- RethinkDB
- Node.js 6.x
- npm 3.x

## Installing

Run `npm install` to grab the project dependencies.   
Run `npm run db:migrate` to execute database migrations (this will handle populating your database with station records).

## Running

Start RethinkDB on its default port.   
Run `npm start` to spin up a local development server.

## Testing

Run `npm test` to run the unit tests.
