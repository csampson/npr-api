'use strict';

const Boom     = require('boom');
const Stations = require('./models/stations');

module.exports = [
  {
    method: 'GET',
    path: '/stations',
    handler: (request, reply) => {
      const filter  = request.query.filter ? new Map(request.query.filter.split(';').map(f => f.split(':'))) : null;
      const options = {
        page: request.query.page,
        filter
      };

      Stations.fetch(options)
        .then(reply)
        .catch(err => {
          Boom.wrap(err, 500);
        });
    }
  }
];
