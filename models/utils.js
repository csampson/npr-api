/**
 * @module   utils
 * @requires database
 */

'use strict'

const database = require('../lib/database')

/**
 * Build a ReQL query object based on a given set of filters
 * @param   {Object} params - Set of filter parameters
 * @returns {Object} ReQL query object
 */
function buildFilter (params) {
  let predicate

  params.forEach((value, param) => {
    if (param !== 'geolocation') {
      predicate = predicate
        ? predicate.and(database.interface.row(param).match(`(?i)${value}`))
        : database.interface.row(param).match(`(?i)${value}`)
    }
  })

  return predicate
}

module.exports = {
  buildFilter
}
