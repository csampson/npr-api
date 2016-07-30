/**
 * @overview Hapi route configurations
 * @module   routes
 * @requires boom
 * @requires joi
 * @requires lodash/toPairs
 * @requires stations
 */

'use strict';

const Boom     = require('boom');
const Joi      = require('joi');
const toPairs  = require('lodash/toPairs');
const Stations = require('./models/stations');

const formatLinkHeader = require('format-link-header');

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
        .then(results => {
          const links     = {};
          const prevPage  = (results.currentPage - 1) || null;
          const nextPage  = results.pageCount - (results.pageCount - results.currentPage) + 1 || null;
          const lastPage  = results.pageCount;
          const endpoint  = `${request.server.info.protocol}://${request.info.host}${request.path}`;
          const response  = reply(results.stations);

          if (nextPage) {
            links.next = {
              rel: 'next',
              url: `${endpoint}?page=${nextPage}`
            };

            links.last = {
              rel: 'last',
              url: `${endpoint}?page=${lastPage}`
            };
          }

          if (prevPage) {
            links.prev = {
              rel: 'prev',
              url: `${endpoint}?page=${prevPage}`
            };
          }

          if (Object.keys(links).length) {
            response.header('Links', formatLinkHeader(links));
          }
        })
        .catch(err => {
          reply(Boom.wrap(err, 500));
        });
    }
  }
];
