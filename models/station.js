/**
 * @overview Stations table interface
 */

'use strict'

const axios = require('axios')
const logger = require('../lib/logger')

/**
 * Page result/size limit
 * @type {number}
 */

class Station {
  /**
   * @param {Database} database A database client instance
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
    return this.database.execute('FT.SEARCH', ['stations', filter.query || 'stations'])
      .then((results) => {
        const stations = new Set()

        // Results start at index:1; first item is the total count
        results.slice(1, results.length).forEach((result) => {
          if (typeof result === 'string') {
            return
          }

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

  /**
   * Fetches the media stream url for a given radio station
   * @param   {Object} title - Title of the radio station to find
   * @returns {Promise} Fetch operation
   */
  fetchStream (title) {
    return this.database.execute('get', `station:${title}.primary_format_stream`)
      .then(streamURL => {
        if (streamURL === null) {
          return Promise.reject(new Error(`Station stream for ${title} not found`))
        }

        // If already an actual media resource (not a playlist), use that
        if (!/.pls$|.m3u$/.test(streamURL)) {
          return Promise.resolve(streamURL)
        }

        // Grab the media resource using the playlist url
        return axios.get(streamURL).then(response => {
          const content = response.data.split('\n')
          const fileURL = content.find(line => /^File1=/.test(line))

          // Get the INI value
          return fileURL.replace(/^File1=/, '')
        })
      })
      .catch(error => {
        logger.error(error)
        return Promise.reject(new Error(`Failed to fetch stream for station with title: ${title}.`))
      })
  }

  fetchLinks (title) {
    return this.database.execute('get', `station:${title}.links`)
      .then(JSON.parse)
      .catch(error => {
        logger.error(error)
        return Promise.reject(new Error(`Failed to fetch links for station with title: ${title}.`))
      })
  }
}

module.exports = Station
