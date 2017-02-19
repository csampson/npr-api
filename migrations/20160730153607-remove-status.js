/* eslint-disable no-console */

'use strict';

function removeStatus(database, connection) {
  console.log('Removing field `status` from `stations` table...');

  return new Promise((resolve, reject) => {
    database.db('radio_api')
      .table('stations')
      .replace(station => station.without('status'))
      .run(connection, results => {
        console.log('...done');
        resolve();
      });
  });
}

function addStatus(database, connection) {
  console.log('Adding field `status` to `stations` table...');

  return new Promise((resolve, reject) => {
    database.db('radio_api')
      .table('stations')
      .update({ status: null })
      .run(connection, results => {
        console.log('...done');
        resolve();
      });
  });
}

function up(database, connection) {
  return removeStatus(database, connection)
    .catch(console.log);
}

function down(database, connection) {
  return addStatus(database, connection)
    .catch(console.log);
}

module.exports.up   = up;
module.exports.down = down;
