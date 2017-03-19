/**
 * @overview Database connection interface
 * @module   database
 * @requires environment
 * @requires rethinkdb
 */

'use strict';

const environment = require('./environment');
const rethinkdb   = require('rethinkdb');

const options = { db: 'radio_api' };

if (environment.get('NODE_ENV') === 'production') {
  Object.assign(options, {
    host: environment.get('DATABASE_HOST'),
    port: environment.get('DATABASE_PORT'),
    user: environment.get('DATABASE_USER'),
    password: environment.get('DATABASE_PASSWORD'),
    ssl: {
      ca: environment.get('DATABASE_CERTIFICATE')
    }
  });
}

/**
 * @class
 */
class Database {
  /**
   * Connect to the database
   * @returns {Promise} Connection result
   */
  static connect() {
    if (this.connection) {
      return Promise.resolve(this.connection);
    }

    return rethinkdb.connect(options)
      .then(result => {
        this.connection = result;
        return result;
      })
      .catch(err => (
        Promise.reject(new Error(`Failed to connect to RethinkDB instance: ${err.message}`))
      ));
  }
}

Database.interface = rethinkdb;
module.exports = Database;
