'use strict';

const Boom     = require('boom');
const Joi      = require('joi');
const toPairs  = require('lodash/toPairs');

const Stations = require('./models/stations');

module.exports = [
  {
    method: 'GET',
    path: '/stations',
    config: {
      description: 'Fetch a collection of NPR member station records',
      tags: ['api'],
      validate: {
        query: {
          filter: Joi.object().keys({
            abbreviation: Joi.string(),
            band: Joi.string(),
            call: Joi.string(),
            format: Joi.string(),
            frequency: Joi.number(),
            geolocation: Joi.array().items(Joi.number()),
            market_city: Joi.string(),
            market_state: Joi.string(),
            name: Joi.string(),
            tagline: Joi.string(),
            title: Joi.string()
          }),
          sort: Joi.string(),
          page: Joi.string()
        }
      }
    },
    handler: (request, reply) => {
      const filter  = request.query.filter ? new Map(toPairs(request.query.filter)) : null;
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
