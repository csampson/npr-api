'use strict';

const Boom = require('boom');
const Joi  = require('joi');

const Stations = require('./models/stations');

module.exports = [
  {
    method: 'GET',
    path: '/stations',
    handler: (request, reply) => {
      Stations.fetch()
        .then(reply)
        .catch(err => {
          Boom.wrap(err, 500);
        });
    }
  }
];
