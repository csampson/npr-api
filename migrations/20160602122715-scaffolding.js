/* eslint-disable no-console */

/**
 * @overview Creates `radio_api` database, `stations` table, content, and index
 * @requires fs
 */

'use strict';

const fs = require('fs');

function createDatabase(database, connection) {
  return new Promise((resolve, reject) => {
    console.log('Creating database `radio_api`...');

    database.dbCreate('radio_api').run(connection, results => {
      resolve(results);
      console.log('...done');
    });
  });
}

function createStationsTable(database, connection) {
  return new Promise((resolve, reject) => {
    console.log('Creating table `stations`');

    database.db('radio_api').tableCreate('stations').run(connection, results => {
      console.log('...done');
      resolve(results);
    });
  });
}

function importStation(station) {
  const content = fs.readFileSync(`${__dirname}/../data/${station}`);
  return JSON.parse(content.toString('utf8'));
}

function importStations(database, connection) {
  console.log('Importing data into `stations`...');

  return new Promise((resolve, reject) => {
    const files    = fs.readdirSync(`${__dirname}/../data/`);
    const imports  = files.map(importStation);

    let stations = imports.reduce((prev, current) => prev.concat(current), []);

    // Insert ReQL geospatial points
    stations = stations.map(station => {
      if (station.geolocation && station.geolocation.longitude) {
        station.geolocation = database.point(station.geolocation.longitude, station.geolocation.latitude);
      } else {
        station.geolocation = null;
      }

      return station;
    });

    database.db('radio_api')
      .table('stations')
      .insert(stations)
      .run(connection, results => {
        console.log('...done');
        resolve(results);
      });
  });
}

function indexGeolocations(database, connection) {
  console.log('Indexing `stations` geolocations...');

  return new Promise((resolve, reject) => {
    database.db('radio_api')
      .table('stations')
      .indexCreate('geolocation', { geo: true })
      .run(connection, results => {
        console.log('...done');
        resolve(results);
      });
  });
}

function deleteDatabase(database, connection) {
  console.log('Dropping `radio_api` database...');

  return new Promise((resolve, reject) => {
    database.dbDrop('radio_api').run(connection, results => {
      console.log('...done');
      resolve(results);
    });
  });
}

function up(database, connection) {
  return createDatabase(database, connection)
    .then(results => createStationsTable(database, connection))
    .then(results => importStations(database, connection))
    .then(results => indexGeolocations(database, connection))
    .catch(console.log);
}

function down(database, connection) {
  return deleteDatabase(database, connection)
    .catch(console.log);
}

module.exports.up   = up;
module.exports.down = down;
