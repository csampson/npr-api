/**
 * @overview Stations table interface
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
   * Fetch a list of radio stations matching a query
   * @param   {Object} [filter={}] - Hashmap of search filtering options
   * @param   {string} [filter.query] - RediSearch query
   * @see     {@link http://redisearch.io/Query_Syntax}
   * @returns {Set} List of matching radio station records
   */
  search (filter = {}) {
    return this.database.execute('FT.SEARCH', ['stations', filter.query || 'fm'])
      .then((results) => {
        const stations = new Set()

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

          stations.add(station)
        })

        return stations
      })
      .catch((error) => {
        logger.error(error)
        return Promise.reject(new Error(`Something went wrong while trying to fetch stations matching your search.`))
      })
  }
}

module.exports = Station
