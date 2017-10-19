test

# The Open Public Radio API

[![Build Status](https://travis-ci.org/openpublicradio/api.svg?branch=master)](https://travis-ci.org/openpublicradio/api)
[![Code Climate](https://codeclimate.com/github/openpublicradio/api/badges/gpa.svg)](https://codeclimate.com/github/openpublicradio/api)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/bcbe60cee5a787554e39)

A REST api for querying information about [NPR](http://npr.org) member stations. It features filtering, geolocation searching, pagination, and sorting.

## Requirements

- Node.js 8.3.x
- npm 5.3.x
- Docker 17.x
- docker-compose 1.x

## Installing

Run `docker-compose build` to build the `web` and `db` docker images (Node.js app and Redis, respectively).

## Running

Run with `docker-compose up`.

## Testing

Use `npm test` to run the unit tests.

## Updating Data

- This requires `NPR_API_KEY` and `GOOGLE_API_KEY` environment variables.
- Use `npm run db:resync` to re-import station data from the NPR api and location data from Google.
