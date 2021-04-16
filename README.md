# npr-api

A GraphQL API for querying information about [NPR](http://npr.org) member stations. Uses the RediSearch database available [here](https://github.com/csampson/npr-db).

## Requirements

- Node ~14.10.1
- Docker
- docker-compose

## Developing

Grab Node.js v14.10.1 or just use nvm.

```sh
nvm use
```

Install dependencies.

```sh
yarn
```

Run locally with `docker-compose up`. This will build the images for the API and database (if necessary) and make the application available at http://localhost:3000

## Testing

Use `yarn test` to run the unit tests.
