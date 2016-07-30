/* eslint-disable no-console */

'use strict';

function removeFields(database, connection) {
  console.log('Removing fields `status` and `title` from `stations` table...');

  return new Promise((resolve, reject) => {
    database.db('radio_api')
      .table('stations')
      .replace(station => station.without('status', 'title'))
      .run(connection, results => {
        console.log('...done');
        resolve();
      });
  });
}

function addFields(database, connection) {
  console.log('Adding fields `status` and `title` to `stations` table...');

  return new Promise((resolve, reject) => {
    database.db('radio_api')
      .table('stations')
      .update({ status: null, title: null })
      .run(connection, results => {
        console.log('...done');
        resolve();
      });
  });
}

function up(database, connection) {
  return removeFields(database, connection)
    .catch(err => { throw new Error(err); });
}

function down(database, connection) {
  return addFields(database, connection)
    .catch(err => { throw new Error(err); });
}

module.exports.up   = up;
module.exports.down = down;
