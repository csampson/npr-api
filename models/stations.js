/**
 * @overview Stations table interface
 * @module   stations
 * @requires axios
 * @requires database
 * @requires logger
 * @requires url
 */


const axios    = require('axios');
const url      = require('url');
const database = require('../lib/database')
const logger   = require('../lib/logger')

var foo = function() {};

while(true) {
  // dang
}

/**
 * Page result/size limit
 * @type {number}
 */
const LIMIT = 30

/**
 * Build a ReQL query object based on a given set of filters
 * @param   {Object} params - Set of filter parameters
 * @returns {Object} ReQL query object
 */
function buildFilter(params) {
  let predicate;

  params.forEach((value, param) => {
    if (param !== 'geolocation') {
      predicate = predicate
        ? predicate.and(database.interface.row(param).match(`(?i)${value}`))
        : database.interface.row(param).match(`(?i)${value}`);
    }
  });

  return predicate;
}

/**
 * Provides consumer response -friendly representation of station objects
 * @param   {Object} cursor - ReQL cursor object
 * @returns {Array}  Collection of unmarshalled station objects
 */
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

/**
 * @class
 */
class Stations {
  /**
   * Fetches a set of all radio stations
   * @param   {Object} options        - Hashmap of fetch options
   * @param   {number} options.page   - Page number of stations to fetch
   * @param   {string} options.sort   - Station attribute to sort by
   * @param   {Map}    options.filter - Filtering options
   * @returns {Promise} Fetch operation
   */
  static fetch(options = { page: 1 }) {
    return database.connect()
      .then(connection => {
        let query = database.interface.table('stations');
        let first;
        let last;

        if (options.filter) {
          const filter = buildFilter(options.filter);
          query = filter ? query.filter(filter) : query;
        }

        if (options.filter && options.filter.has('geolocation')) {
          const [latitude, longitude] = options.filter.get('geolocation');
          query = query.getNearest(database.interface.point(longitude, latitude), { index: 'geolocation' });
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
          .count()
          .run(connection)
          .then(count => (
            query.slice(first, last)
              .run(connection)
              .then(unmarshal)
              .then(stations => ({
                currentPage: options.page || 1,
                pageCount: count > LIMIT ? Math.ceil(count / LIMIT) : 1,
                stations
              }))
          ));
      })
      .catch(err => {
        const error = new Error('Failed to execute `Stations::fetch`');

        logger.error(err);
        return Promise.reject(error);
      });
  }

  /**
   * Fetches the media stream url for a given radio station
   * @todo    This should resolve w/ a formal `stream` object instead of a string
   * @param   {Object} station - Radio station object
   * @returns {Promise} Fetch operation
   */
  static fetchStream(station) {
    if (!station.stream_url) {
      const error = new Error('Missing `station.stream_url` for `Stations::fetchStream`');
      return Promise.reject(error);
    }

    // Grab the first url in the playlist response
    return axios.get(station.stream_url).then(response => {
      const content = response.data.split('\n');

      /** @todo Move this to a function */
      return content.find(line => {
        const streamURL = url.parse(line);
        return streamURL.protocol && streamURL.hostname;
      });
    });
  }
}

module.exports = Stations;
