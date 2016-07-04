'use strict';

const Boom     = require('boom');
const Stations = require('./models/stations');

module.exports = [
  {
    method: 'GET',
    path: '/stations',
    handler: (request, reply) => {
      const options = {
        page: request.query.page
      };

      Stations.fetch(options)
        .then(reply)
        .catch(err => {
          Boom.wrap(err, 500);
        });
    }
  }
];
