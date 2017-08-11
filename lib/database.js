/**
 * @overview Redis wrapper for working with promises
 * @requires redis
 */

'use strict';

const redis = require('redis');

const RedisError = redis.RedisError;
const SOCKET_PATH = '/var/run/redis/redis.sock';

class Database {
  constructor(options) {
    this.client = redis.createClient(SOCKET_PATH);
    return this;
  }

  /**
   * Execute a redis command
   * @param   {string} command - The command to execute
   * @param   {...*} args - Redis command options to pass through to the client
   * @returns {Promise} Execution operation
   */
  async execute(command, ...args) {
    return new Promise((resolve, reject) => {
      const callback = (err, record) => {
        if (err instanceof RedisError) {
          reject(err);
        } else {
          resolve(record);
        }
      };

      if (command === 'batch') {
        this.client.batch(...args).exec(callback);
      } else if (command === 'multi') {
        this.client.multi(...args).exec(callback);
      } else {
        this.client[command](...args, callback);
      }
    });
  }
}

module.exports = Database;
