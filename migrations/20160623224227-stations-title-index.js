/* eslint-disable no-console */

'use strict';

function createIndex(database, connection) {
  console.log('Adding `title` index to `stations` table...');

  return new Promise((resolve, reject) => {
    database.db('radio_api')
      .table('stations')
      .indexCreate('title')
      .run(connection, results => {
        console.log('...done');
        resolve();
      });
  });
}

function deleteIndex(database, connection) {
  console.log('Delete `title` index from `stations` table...');

  return new Promise((resolve, reject) => {
    database.db('radio_api')
      .table('stations')
      .indexDrop('title')
      .run(connection, results => {
        console.log('...done');
        resolve();
      });
  });
}

function up(database, connection) {
  return createIndex(database, connection)
    .catch(err => { throw new Error(err); });
}

function down(database, connection) {
  return deleteIndex(database, connection)
    .catch(err => { throw new Error(err); });
}

module.exports.up   = up;
module.exports.down = down;
