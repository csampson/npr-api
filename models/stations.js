/**
 * @overview Stations table interface
 * @module   stations
 * @requires rethinkdb
 */

'use strict';

const database = require('rethinkdb');
const LIMIT    = 30;

function connect() {
  return database.connect({ db: 'radio_api' });
}

function buildFilter(params) {
  let predicate;

  params.forEach((value, param) => {
    if (param !== 'geolocation') {
      predicate = predicate ? predicate.and(database.row(param).match(`(?i)${value}`)) : database.row(param).match(`(?i)${value}`);
    }
  });

  return predicate;
}

function unmarshal(cursor) {
  // Manually convert ReQL `@geolocation` to GeoJSON
  return cursor.toArray().map(station => {
    if ('doc' in station) {
      station = station.doc;
    }

    if (station.geolocation) {
      station.geolocation = {
        coordinates: station.geolocation.coordinates,
        type: station.geolocation.type
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
  static fetch(options = { page: 1 }) {
    return connect()
      .then(connection => {
        let query = database.table('stations');
        let first;
        let last;

        if (options.filter) {
          const filter = buildFilter(options.filter);
          query = filter ? query.filter(filter) : query;
        }

        if (options.filter && options.filter.has('geolocation')) {
          const [longitude, latitude] = options.filter.get('geolocation').split(',');
          query = query.getNearest(database.point(+longitude, +latitude), { index: 'geolocation' });
        }

        if (options.sort) {
          query = query.orderBy(options.sort);
        }

        if (options.page > 1) {
          first = (options.page - 1) * LIMIT;
          last  = first + (LIMIT);
        } else {
          first = 0;
          last  = LIMIT;
        }

        return query
          .slice(first, last)
          .run(connection)
          .then(unmarshal)
          .catch(err => (
            Promise.reject(new Error('Failed to run database query for `Stations::fetch`'))
          ));
      })
      .catch(err => (
        Promise.reject(new Error('Failed to connect to database for `Stations::fetch`'))
      ));
  }
}

module.exports = Stations;
