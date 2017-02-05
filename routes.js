/**
 * @overview Hapi route configurations
 * @module   routes
 * @requires boom
 * @requires joi
 * @requires lodash/toPairs
 * @requires stations
 */

'use strict';

const Boom             = require('boom');
const Joi              = require('joi');
const toPairs          = require('lodash/toPairs');
const Stations         = require('./models/stations');
const stationsSchema   = require('./schemas/station');
const formatLinkHeader = require('format-link-header');

const schemas = {
  station: stationsSchema
};

module.exports = [
  {
    method: 'GET',
    path: '/stations',
    config: {
      cors: true,
      validate: {
        query: {
          filter: schemas.station,
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
  },

  {
    method: 'GET',
    path: '/stations/{id}',
    config: {
      cors: true,
      validate: {
        params: {
          id: Joi.string().guid()
        }
      }
    },
    handler: (request, reply) => {
      const filter = new Map().set('id', request.params.id);

      Stations.fetch({ filter })
        .then(results => {
          reply(results.stations);
        })
        .catch(err => {
          reply(Boom.wrap(err, 500));
        });
    }
  }
];
