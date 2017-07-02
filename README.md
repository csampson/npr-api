# The Open Public Radio API

[![Build Status](https://travis-ci.org/openpublicradio/api.svg?branch=master)](https://travis-ci.org/openpublicradio/api)
[![Code Climate](https://codeclimate.com/github/openpublicradio/api/badges/gpa.svg)](https://codeclimate.com/github/openpublicradio/api)
[![Test Coverage](https://codeclimate.com/github/openpublicradio/api/badges/coverage.svg)](https://codeclimate.com/github/openpublicradio/api/coverage)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/bcbe60cee5a787554e39)

A REST api for querying information about [NPR](http://npr.org) member stations. It features filtering, geolocation searching, pagination, and sorting.

## Requirements

- Redis 3.2.x
- Node.js 8.x
- npm 5.x

## Installing

Run `npm install` to grab the project dependencies.   
Run `npm run setup-database` to populate Redis with station data from the static JSON located in `data/`.

## Running

Start Redis on its default port.
Run `npm start` to spin up a local development server.

## Testing

Run `npm test` to run the unit tests.
