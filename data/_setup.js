/* eslint-disable no-console */

/**
 * @overview Sets up application database for local dev
 * @module   setup
 * @requires database
 * @requires fs
 */

'use strict';

const fs        = require('fs');
const Database  = require('../lib/database');

function importStation(station) {
  const content = fs.readFileSync(`${__dirname}/${station}`);
  return JSON.parse(content.toString('utf8'));
}

const files   = fs.readdirSync(`${__dirname}`).filter(file => file !== '_setup.js');
const imports = files.map(importStation);
const stationsDatabase = Database.interface.db('npr_member_stations');
const stationsTable    = Database.interface.db('npr_member_stations').table('stations');

let stations = imports.reduce((prev, current) => prev.concat(current), []);
let databaseConnection;

// Insert ReQL geospatial points
stations = stations.map(station => {
  if (station.geolocation && station.geolocation.longitude) {
    station.geolocation = Database.interface.point(station.geolocation.longitude, station.geolocation.latitude);
  } else {
    station.geolocation = null;
  }

  return station;
});

// Create and setup the `npr_member_stations` database
Database.connect()
  .then(connection => {
    databaseConnection = connection;

    return Database.interface
      .dbCreate('npr_member_stations')
      .run(databaseConnection);
  })
  .then(() => (
    stationsDatabase
      .tableCreate('stations')
      .run(databaseConnection)
  ))
  .then(() => (
    stationsTable
      .insert(stations)
      .run(databaseConnection)
  ))
  .then(() => (
    stationsTable
      .indexCreate('title')
      .run(databaseConnection)
  ))
  .then(() => (
    stationsTable
      .indexCreate('geolocation', { geo: true })
      .run(databaseConnection)
  ))
  .then(() => {
    console.log('Database `npr_member_stations` setup complete.');
    process.exit(0);
  })
  .catch(err => {
    console.log(`Database \`npr_member_stations\` setup failed:\n${err}`);
    process.exit(1);
  });
