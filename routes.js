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
const Stations         = require('./models/stations');
const stationsSchema   = require('./schemas/station');

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

      /** @todo Document what's happening here */
      Stations.fetch(options)
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

      /** @todo Document what's happening here */
      Stations.fetch({ filter })
        .then(results => {
          if (results.stations.length) {
            reply(results.stations);
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
    path: '/stations/{id}/stream',
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

      /** @todo Document what's happening here */
      Stations.fetch({ filter })
        .then(results => {
          if (results.stations.length) {
            const [station] = results.stations;

            if (station && station.stream_url) {
              Stations.fetchStream(station).then(reply).catch(Boom.wrap);
            } else {
              reply(Boom.notFound('Station stream url not found'));
            }
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
