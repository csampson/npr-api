/**
 * @overview Stations table interface
 * @module   stations
 */

'use strict';

const database = require('rethinkdb');

let connection;

database.connect({ db: 'radio_api' })
  .then(conn => { connection = conn; })
  .catch(err => { throw new Error(err); });

function queryStations() {
  return database.table('stations').run(connection);
}

class Stations {
  /**
   * Fetches a set of all radio stations
   * @returns {Promise} Fetch operation
   */
  static fetch() {
    return queryStations()
      .then(cursor => (
        // Manually convert ReQL `@geolocation` to GeoJSON
        cursor.toArray().map(station => {
          if (station.geolocation) {
            station.geolocation = {
              geolocation: {
                coordinates: station.geolocation.coordinates,
                type: station.geolocation.type
              }
            };
          }

          return station;
        })
      ))
      .catch(err => (
        Promise.reject(new Error('Failed to run database query for `Stations::fetch`'))
      ));
  }
}

module.exports = Stations;
