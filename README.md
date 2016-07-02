# public-radio-api

This a REST api that provides a list of all [NPR](http://npr.org) member stations.

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
