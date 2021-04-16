/**
 * @overview Stations interface
 */

'use strict'

const logger = require('../lib/logger')

class Station {
  /**
   * @param {Database} database - The database client instance
   */
  constructor (database) {
    this.database = database
  }

  /**
   * Query redisearch for a set of radio stations
   * @param {string} [query] - RediSearch query
   * @see {@link http://redisearch.io/Query_Syntax}
   * @returns {Array} List of matching radio station records
   */
  search (query = '') {
    query.replace(/\*/g, '')

    return this.database.execute('FT.SEARCH', ['stations', query + '*'])
      .then((results) => {
        const stations = []

        // Results start at index:1; first item is the total count
        // Subsequent items are hash [key, value]
        results.slice(1, results.length).forEach((result) => {
          if (typeof result === 'string') {
            return
          }

          const station = result[result.indexOf('json') + 1]

          stations.push(JSON.parse(station))
        })

        return stations
      })
      .catch((error) => {
        logger.error(error)
        return Promise.reject(new Error('Something went wrong while trying to fetch stations matching your search.'))
      })
  }
}

module.exports = Station
