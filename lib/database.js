/**
 * @overview Redis wrapper for working with promises
 */

'use strict'

const redis = require('redis')
const { promisify } = require('util')

class Database {
  constructor () {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    })

    return this
  }

  /**
   * Execute a redis command
   * @param {string} command - The command to execute
   * @param {Array} args - Redis command options to pass through to the client
   * @returns {Promise} Execution operation
   */
  async execute (command, args) {
    return promisify(this.client.send_command).call(this.client, command, args)
  }
}

module.exports = Database
