/**
 * @overview Stations table interface
 * @module   stations
 */

'use strict';

const database = require('rethinkdb');

let connection;

database.connect({ db: 'radio_api' })
  .then(conn => { connection = conn; })
  .catch(err => { throw new Error(err); });

function run() {
  return database.table('stations').run(connection);
}

class Stations {
  /**
   * Fetches a set of all radio stations
   * @returns {Promise} Fetch operation
   */
  static fetch() {
    return run()
      .then(cursor => (
        cursor.toArray()
      ))
      .catch(err => (
        Promise.reject(new Error('Failed to run database query for `Stations::fetch`'))
      ));
  }
}

module.exports = Stations;
