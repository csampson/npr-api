/**
 * @overview Stations table interface
 * @module   stations
 * @requires rethinkdb
 */

'use strict';

const database = require('rethinkdb');
const LIMIT    = 30;

let connection;

database.connect({ db: 'radio_api' })
  .then(conn => { connection = conn; })
  .catch(err => { throw new Error(err); });

function filter(params) {
  if (!params) {
    return null;
  }

  let predicate;

  params.forEach((value, param) => {
    predicate = predicate ? predicate.and(database.row(param).match(`(?i)${value}`)) : database.row(param).match(`(?i)${value}`);
  });

  return predicate;
}

function unmarshal(cursor) {
  // Manually convert ReQL `@geolocation` to GeoJSON
  return cursor.toArray().map(station => {
    if (station.geolocation) {
      station.geolocation = {
        geolocation: {
          coordinates: station.geolocation.coordinates,
          type: station.geolocation.type
        }
      };
    }

    return station;
  });
}

class Stations {
  /**
   * Fetches a set of all radio stations
   * @param   {Object} options        - Hashmap of fetch options
   * @param   {number} options.page   - Page number of stations to fetch
   * @param   {Map}    options.filter - Filtering options
   * @returns {Promise} Fetch operation
   */
  static fetch(options = {}) {
    let first;
    let last;

    if (options.page > 1) {
      first = (options.page - 1) * LIMIT;
      last  = first + (LIMIT);
    } else {
      first = 0;
      last  = LIMIT;
    }

    return database.table('stations')
      .filter(filter(options.filter))
      .slice(first, last)
      .run(connection)
      .then(unmarshal)
      .catch(err => (
        Promise.reject(new Error('Failed to run database query for `Stations::fetch`'))
      ));
  }
}

module.exports = Stations;
