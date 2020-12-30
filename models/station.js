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
  search (query) {
    return this.database.execute('FT.SEARCH', ['stations', query])
      .then((results) => {
        const stations = []

        // Results start at index:1; first item is the total count
        results.slice(1, results.length).forEach((result) => {
          if (typeof result === 'string') {
            return
          }

          // Marshal a station object from an array of Redis keys/values
          // in the form of [key, value, key, value]
          const station = result.reduce((prev, curr, index, collection) => {
            if (index % 2 === 0) {
              const value = collection[index + 1]

              prev[curr] = curr === 'urls'
                ? JSON.parse(value)
                : value
            }

            return prev
          }, {})

          stations.push(station)
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
