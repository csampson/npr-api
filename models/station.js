/**
 * @overview Stations table interface
 * @module   station
 * @requires axios
 * @requires database
 * @requires logger
 * @requires url
 * @requires utils
 */

'use strict';

const axios    = require('axios');
const url      = require('url');
const database = require('../lib/database');
const logger   = require('../lib/logger');

const { buildFilter, unmarshal } = require('./utils');

/**
 * Page result/size limit
 * @type {number}
 */
const LIMIT = 30;

/**
 * @class
 */
class Station {
  static fetch(title) {
    const query = database.interface
      .table('stations')
      .get(title)
      .without({ geolocation: '$reql_type$' });

    return database.connect()
      .then(connection => (
        query.run(connection)
      ))
      .catch(err => {
        const error = new Error(`Failed to execute \`Station::fetch\`: ${err}`);

        logger.error(err);
        return Promise.reject(error);
      });
  }

  /**
   * Gets a list of all radio stations
   * @param   {Object} options        - Hashmap of fetch options
   * @param   {number} options.page   - Page number of stations to fetch
   * @param   {string} options.sort   - Station attribute to sort by
   * @param   {Map}    options.filter - Filtering options
   * @returns {Promise} List operation
   */
  static list(options = { page: 1 }) {
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
              .without({ geolocation: '$reql_type$' })
              .run(connection)
              .then(stations => stations.toArray())
              .then(stations => ({
                currentPage: options.page || 1,
                pageCount: count > LIMIT ? Math.ceil(count / LIMIT) : 1,
                stations
              }))
          ));
      })
      .catch(err => {
        const error = new Error(`Failed to execute \`Station::list\`: ${err}`);

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
    if (!station) {
      const error = new Error('Missing `station` for `Station::fetchStream`');
      return Promise.reject(error);
    }

    const streamURL = station.urls.streams.find(stationURL => stationURL.rel === 'primary_format_stream');

    if (!streamURL) {
      const error = new Error('No stream URL found for `Station::fetchStream`');
      return Promise.reject(error);
    }

    /** @todo canonical stream resource obj. */
    if (!/.pls$|.m3u$/.test(streamURL)) {
      return Promise.resolve(streamURL.href);
    }

    // Grab the first url in the playlist response
    return axios.get(streamURL.href).then(response => {
      const content = response.data.split('\n');

      /** @todo Move this to a function */
      /** @todo Should this return with `url.path`? */
      return content.find(line => {
        const parsedURL = url.parse(line);
        return parsedURL.protocol && parsedURL.hostname;
      });
    });
  }
}

module.exports = Station;
