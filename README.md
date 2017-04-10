# Open Public Radio API

[![Build Status](https://travis-ci.org/openpublicradio/api.svg?branch=master)](https://travis-ci.org/openpublicradio/api)
[![bitHound Overall Score](https://www.bithound.io/github/openpublicradio/api/badges/score.svg)](https://www.bithound.io/github/openpublicradio/api)
[![Code Climate](https://codeclimate.com/github/openpublicradio/api/badges/gpa.svg)](https://codeclimate.com/github/openpublicradio/api)
[![Test Coverage](https://codeclimate.com/github/openpublicradio/api/badges/coverage.svg)](https://codeclimate.com/github/openpublicradio/api/coverage)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/a66c9fc83d5c8395bd22#?env%5Bproduction%5D=W3sidHlwZSI6InRleHQiLCJlbmFibGVkIjp0cnVlLCJrZXkiOiJwYmlfZW5kcG9pbnQiLCJ2YWx1ZSI6Imh0dHA6Ly9wdWJsaWMtcmFkaW8tYXBpLmhlcm9rdWFwcC5jb20ifV0=)

A REST api for querying information about [NPR](http://npr.org) member stations. It features filtering, geolocation searching, pagination, and sorting.

## Requirements

- RethinkDB
- Node.js 6.x
- npm 3.x

## Installing

Run `npm install` to grab the project dependencies.   
Run `npm run setup-database` to create and populate an `radio_api` database

## Running

Start RethinkDB on its default port.   
Run `npm start` to spin up a local development server.

## Testing

Run `npm test` to run the unit tests.
