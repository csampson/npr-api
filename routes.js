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
        sort: request.query.sort,
        filter
      };

      Stations.fetch(options)
        .then(reply)
        .catch(err => {
          reply(Boom.wrap(err, 500));
        });
    }
  }
];
