/**
 * @module   utils
 * @requires database
 */

'use strict';

const database = require('../lib/database');

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
    /** @todo Necessary? */
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

module.exports = {
  buildFilter,
  unmarshal
};
