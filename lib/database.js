/**
 * @overview Redis client
 */

'use strict'

const { createClient } = require('redis')
const logger = require('../lib/logger')

class Database {
  constructor () {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    })

    this.client.on('error', (err) => {
      logger.error('Redis client error:', err)
    })

    this.client.connect()

    return this
  }
}

module.exports = Database
