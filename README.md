# The Open Public Radio API

A GraphQL API for querying information about [NPR](http://npr.org) member stations.

## Requirements

- Docker
- docker-compose

## Developing

Run locally with `docker-compose up`. This will build the images for the API and database (if necessary) and make the application available at http://localhost:3000

## Testing

Use `npm test` to run the unit tests.

## Updating Data

TODO: Update import process to use NPR API v3

- This requires `NPR_API_KEY` and `GOOGLE_API_KEY` environment variables.
- Use `npm run data:pull` to re-import station data from the NPR API and grab geolocation data from Google.
