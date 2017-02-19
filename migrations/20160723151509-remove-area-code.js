/* eslint-disable no-console */

'use strict';

function removeAreaCode(database, connection) {
  console.log('Removing field `area_code` from `stations` table...');

  return new Promise((resolve, reject) => {
    database.db('radio_api')
      .table('stations')
      .replace(station => station.without('area_code'))
      .run(connection, results => {
        console.log('...done');
        resolve();
      });
  });
}

function addAreaCode(database, connection) {
  console.log('Adding field `area_code` to `stations` table...');

  return new Promise((resolve, reject) => {
    database.db('radio_api')
      .table('stations')
      .update({ area_code: null })
      .run(connection, results => {
        console.log('...done');
        resolve();
      });
  });
}

function up(database, connection) {
  return removeAreaCode(database, connection)
    .catch(console.log);
}

function down(database, connection) {
  return addAreaCode(database, connection)
    .catch(console.log);
}

module.exports.up   = up;
module.exports.down = down;
