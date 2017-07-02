/**
 * @overview Stations table interface
 * @module   station
 * @requires axios
 * @requires lodash/snakeCase
 * @requires logger
 */

'use strict';

const axios = require('axios');
const snakeCase = require('lodash/snakeCase');

const logger = require('../lib/logger');

/**
 * Page result/size limit
 * @type {number}
 */
const LIMIT = 20;

class Station {
  /**
   * @param {Database} database A database client instance
   */
  constructor(database) {
    this.database = database;
  }

  /**
   * Retrieve a single station record
   * @param   {string} title - Station's `title` (e.g. 'WWNO-FM')
   * @returns {Promise} Fetch operation
   */
  fetch(title) {
    return this.database.execute('get', `station:${title}`)
      .then(JSON.parse)
      .catch(error => {
        logger.error(error);
        return Promise.reject(new Error(`Failed to fetch station with title: ${title}.`));
      });
  }

  /**
   * Gets a list of all radio stations
   * @param   {Object} options         - Hashmap of fetch options
   * @param   {Map}    options.filter  - Filtering options
   * @param   {Object} options.geoNear - Geolocation search options
   * @param   {number} options.page    - Page number of stations to fetch
   * @param   {string} options.sortBy  - Station attribute to sort by
   * @returns {Promise} List operation
   */
  async list(options = {}) {
    options = Object.assign({ filter: null, geoNear: null, page: 1, sortBy: 'title' }, options);

    const offset = (options.page > 1) ? ((options.page - 1) * LIMIT) : 0;
    const lookupKeys = [];
    let resultKey = 'station';

    if (options.filter && options.filter.size) {
      resultKey += `.filter.${
        [...options.filter.entries()]
          .sort()
          .map(([attr, value]) => `${attr}:${snakeCase(value).toLowerCase()}`)
          .join('.')
      }`;
    }

    if (options.geoNear) {
      const [latitude, longitude] = options.geoNear.coordinates;
      const distance = options.geoNear.distance || 50;
      resultKey += `.geoNear.coordinates:${longitude},${latitude};distance:${distance}`;
    }

    if (!options.filter && !options.geoNear) {
      resultKey = `station.${options.sortBy}`;
    }

    // Apply geolocation searching
    /** @todo use `EXPIRE` command */
    if (options.geoNear) {
      const [latitude, longitude] = options.geoNear.coordinates;
      const distance = options.geoNear.distance || 50;
      const geoSetKey = `station.geoNear.coordinates:${latitude},${longitude};distance:${distance}`;

      await this.database.execute('georadius', 'station.geolocation', longitude, latitude, distance, 'mi', 'store', geoSetKey);
      lookupKeys.push({ name: geoSetKey, weight: 1 });
    }

    // Apply filtering
    if (options.filter) {
      options.filter.forEach((value, attr) => {
        lookupKeys.push({ name: `station.${attr}:${snakeCase(value).toLowerCase()}`, weight: 1 });
      });
    }

    // Apply sorting
    if (options.sortBy) {
      lookupKeys.push({ name: `station.${options.sortBy}`, weight: 2 });
    } else {
      lookupKeys.push({ name: 'station.title', weight: 2 });
    }

    // Create a page for this filter set
    /** @todo use `EXPIRE` command */
    const count = await this.database.execute('zinterstore', resultKey, lookupKeys.length, ...lookupKeys.map(k => k.name), 'weights', ...lookupKeys.map(k => k.weight));

    // Paginate by obtaining a subset of matching keys, then executing redis `GET` for each
    const keys = await this.database.execute('zrange', resultKey, offset, (offset + LIMIT) - 1);
    const commands = keys.map((k) => ['get', k]);

    return this.database.execute('batch', commands)
      .then((results) => ({
        currentPage: options.page,
        stations: results.map(JSON.parse),
        pageCount: Math.ceil(count / LIMIT)
      }))
      .catch((error) => {
        logger.error(error);
        return Promise.reject(new Error(`Failed to fetch stations using options ${JSON.stringify(options)}.`));
      });
  }

  /**
   * Fetches the media stream url for a given radio station
   * @param   {Object} title - Title of the radio station to find
   * @returns {Promise} Fetch operation
   */
  fetchStream(title) {
    return this.database.execute('get', `station:${title}.primary_format_stream`)
      .then(streamURL => {
        if (streamURL === null) {
          return Promise.reject(new Error(`Station stream for ${title} not found`));
        }

        // If already an actual media resource (not a playlist), use that
        if (!/.pls$|.m3u$/.test(streamURL)) {
          return Promise.resolve(streamURL);
        }

        // Grab the media resource using the playlist url
        return axios.get(streamURL).then(response => {
          const content = response.data.split('\n');
          const fileURL = content.find(line => /^File1=/.test(line));

          // Get the INI value
          return fileURL.replace(/^File1=/, '');
        });
      })
      .catch(error => {
        logger.error(error);
        return Promise.reject(new Error(`Failed to fetch stream for station with title: ${title}.`));
      });
  }
}

module.exports = Station;
