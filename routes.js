'use strict';

const Boom     = require('boom');
const Joi      = require('joi');
const database = require('rethinkdb');

// @todo Move this to `lib/database`
let dbConnection;

database.connect({ db: 'radio_api' })
  .then(conn => { dbConnection = conn; })
  .catch(err => { throw new Error(err); });

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply();
    }
  },

  {
    method: 'GET',
    path: '/stations',
    handler: (request, reply) => {
      database.table('stations').run(dbConnection, (err, cursor) => {
        cursor.toArray((err, set) => {
          reply(set);
        });
      });
    }
  }
];
