# The Open Public Radio API

A GraphQL API for querying information about [NPR](http://npr.org) member stations. Uses the RediSearch database available [here](https://github.com/csampson/npr-db).

## Requirements

- Docker
- docker-compose

## Developing

Run locally with `docker-compose up`. This will build the images for the API and database (if necessary) and make the application available at http://localhost:3000

## Testing

Use `npm test` to run the unit tests.
