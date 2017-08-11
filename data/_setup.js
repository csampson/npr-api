/* eslint-disable no-console */

/**
 * @overview Sets up application database for local dev
 * @requires database
 * @requires fs
 * @requires lodash/snakeCase
 * @requires lodash/sortBy
 */

'use strict';

const fs = require('fs');
const snakeCase = require('lodash/snakeCase');
const sortBy = require('lodash/sortBy');

const Database = require('../lib/database');

function importStation(station) {
  const content = fs.readFileSync(`${__dirname}/${station}`);
  return JSON.parse(content.toString('utf8'));
}

const files = fs.readdirSync(`${__dirname}`).filter(file => file !== '_setup.js');
const stations = files.map(importStation).reduce((prev, current) => prev.concat(current), []);
const database = new Database();

database.client.on('error', (err) => {
  throw new Error(`Stations import failed: ${err}`);
});

let operations = sortBy(stations, 'title').map((station, index) => {
  const key = `station:${station.title}`;
  const { longitude, latitude } = station.geolocation;
  const commands = [];

  console.log(`Importing [${key}]...`);

  /** @todo Clean up static station data */
  station.coordinates = [station.geolocation.latitude, station.geolocation.longitude];
  delete station.geolocation;

  commands.push(
      ['set', key, JSON.stringify(station)],
      ['zadd', `station.band:${station.band.toLowerCase()}`, index, key],
      ['zadd', `station.call:${station.call.toLowerCase()}`, index, key],
      ['zadd', `station.format:${station.format}`, index, key],
      ['zadd', `station.frequency:${station.frequency}`, index, key],
      ['zadd', `station.market_city:${snakeCase(station.market_city).toLowerCase()}`, index, key],
      ['zadd', `station.market_state:${snakeCase(station.market_state).toLowerCase()}`, index, key]
  );

  if (longitude && latitude) {
    commands.push(['geoadd', 'station.geolocation', longitude, latitude, key]);
  }

  if (station.urls.streams.length) {
    const streamURL = station.urls.streams.find(url => (
      url.rel === 'primary_format_stream')
    );

    if (streamURL) {
      commands.push(['set', `${key}.primary_format_stream`, streamURL.href]);
    }
  }

  return database.execute('multi', commands);
});

// Add sorted set indexes (for sorting by station attr)
['band', 'call', 'format', 'frequency', 'market_city', 'market_state', 'name', 'title'].forEach((key) => {
  console.log(`Indexing stations sorted by: ${key}...`);

  operations = operations.concat(
    sortBy(stations, key).map((station, index) => (
      database.execute('zadd', `station.${key}`, index, `station:${station.title}`)
    ))
  );
});

Promise.all(operations)
  .then(() => {
    console.log('Done.');
    database.client.quit();
  })
  .catch((err) => {
    console.error(err);
  });
