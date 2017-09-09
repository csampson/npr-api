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

function sortKeys(object) {
  const sortedObject = {};

  Object.keys(object)
    .sort()
    .forEach((attr) => { sortedObject[attr] = object[attr]; });

  return sortedObject;
}

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
  const links = station.urls;
  const commands = [];

  /** @todo Clean up static station data */
  station.address = station.address.join(' ');
  station.coordinates = [station.geolocation.latitude, station.geolocation.longitude];
  delete station.geolocation;
  delete station.urls;

  commands.push(
      ['set', key, JSON.stringify(sortKeys(station))],
      ['set', `${key}.links`, JSON.stringify(links)],
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

  if (links.streams.length) {
    const streamURL = links.streams.find(url => (
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
  operations = operations.concat(
    sortBy(stations, key).map((station, index) => (
      database.execute('zadd', `station.${key}`, index, `station:${station.title}`)
    ))
  );
});

console.log('Loading station records...');

Promise.all(operations)
  .then(() => {
    console.log('Done.');
    database.client.quit();
  })
  .catch((err) => {
    console.error(err);
  });
