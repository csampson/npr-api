# The Open Public Radio API

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/bcbe60cee5a787554e39)

A GraphQL API for querying information about [NPR](http://npr.org) member stations. It features filtering, geolocation searching, pagination, and sorting.

## Requirements

- yarn 1.x
- Node.js 14.x
- npm 6.x
- Docker 18.x
- docker-compose 1.x

## Installing

Run `docker-compose build` to build the `web` and `db` docker images (Node.js app and Redis, respectively).

## Running

Run with `docker-compose up`.

## Testing

Use `npm test` to run the unit tests.

## Updating Data

- This requires `NPR_API_KEY` and `GOOGLE_API_KEY` environment variables.
- Use `npm run data:pull` to re-import station data from the NPR API and grab geolocation data from Google.
