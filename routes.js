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
const formatLinkHeader = require('format-link-header');
const Joi              = require('joi');
const toPairs          = require('lodash/toPairs');
const Station          = require('./models/station');
const stationSchema    = require('./schemas/station');

const schemas = {
  station: stationSchema
};

/** @todo  Strip `Error#message` from error responses */
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
          page: Joi.number()
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

      /** @todo Document what's happening here */
      Station.list(options)
        .then(results => {
          const links     = {};
          const prevPage  = (results.currentPage - 1) || null;
          const nextPage  = (results.currentPage + 1) === results.pageCount ? null : results.currentPage + 1;
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
            response.header('Link', formatLinkHeader(links));
          }
        })
        .catch(err => {
          reply(Boom.wrap(err, 500));
        });
    }
  },

  {
    method: 'GET',
    path: '/stations/{title}',
    config: {
      cors: true,
      validate: {
        params: {
          title: Joi.string()
        }
      }
    },
    handler: (request, reply) => {
      /** @todo Document what's happening here */
      Station.fetch(request.params.title)
        .then(result => {
          if (result) {
            reply(result);
          } else {
            reply(Boom.notFound('Station record not found'));
          }
        })
        .catch(err => {
          reply(Boom.wrap(err, 500));
        });
    }
  },

  {
    method: 'GET',
    path: '/stations/{title}/stream',
    config: {
      cors: true,
      validate: {
        params: {
          title: Joi.string()
        }
      }
    },
    handler: (request, reply) => {
      /** @todo Document what's happening here */
      Station.fetch(request.params.title)
        .then(result => {
          if (result) {
            const station = result;

            Station.fetchStream(station)
              .then(uri => reply(uri).type('text/plain'))
              .catch(Boom.notFound('Station stream url not found'));
          } else {
            reply(Boom.notFound('Station record not found'));
          }
        })
        .catch(err => {
          reply(Boom.wrap(err, 500));
        });
    }
  }
];
