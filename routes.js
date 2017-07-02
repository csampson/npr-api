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
const Database         = require('./lib/database');
const Station          = require('./models/station');
const filterSchema     = require('./schemas/filter');
const geoNearSchema    = require('./schemas/geo-near');

const schemas = {
  filter: filterSchema,
  geoNear: geoNearSchema
};

const database = new Database();
const station = new Station(database);

if (process.env.NODE_ENV === 'production') {
  database.connect({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  });
} else {
  database.connect({
    host: '127.0.0.1',
    port: 6379
  });
}

/** @todo  Strip `Error#message` from error responses */
module.exports = [
  {
    method: 'GET',
    path: '/stations',
    config: {
      cors: true,
      validate: {
        query: {
          filter: schemas.filter,
          geoNear: schemas.geoNear,
          sort: Joi.string(),
          page: Joi.number()
        }
      }
    },
    handler: (request, reply) => {
      const filter  = request.query.filter ? new Map(toPairs(request.query.filter)) : null;
      const geoNear = request.query.geoNear || null;
      const options = { filter, geoNear };

      if (request.query.page) {
        options.page = request.query.page;
      }

      if (request.query.sort) {
        options.sortBy = request.query.sort;
      }

      /** @todo Document what's happening here */
      station.list(options)
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
      station.fetch(request.params.title)
        .then(result => {
          if (result) {
            reply(result);
          } else {
            reply(Boom.notFound('Station record not found'));
          }
        })
        .catch(Boom.err);
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
    handler: (request, reply) => (
      station.fetchStream(request.params.title)
        .then(streamURL => {
          const response = reply(streamURL);
          response.type('text/plain');
        })
        .catch(err => {
          reply(Boom.wrap(err, 500));
        })
    )
  }
];
