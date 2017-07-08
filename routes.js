/**
 * @overview Hapi route configurations
 * @module   routes
 * @requires ajv
 * @requires lodash/toPairs
 * @requires station
 * @requires qs
 */

'use strict';

const Ajv = require('ajv');
const formatLinkHeader = require('format-link-header');
const toPairs = require('lodash/toPairs');
const qs = require('qs');

const Database = require('./lib/database');
const Station = require('./models/station');
const filterSchema = require('./schemas/filter');
const geoNearSchema = require('./schemas/geo-near');

const ajv = new Ajv({ jsonPointers: true });
const database = new Database();
const station = new Station(database);

ajv.addSchema(filterSchema, 'filter');
ajv.addSchema(geoNearSchema, 'geoNear');

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
    path: `/${process.env.LOADER_TOKEN}/`,
    handler: (reqest, reply) => {
      reply(process.env.LOADER_TOKEN);
    }
  },
  {
    method: 'GET',
    path: '/stations',
    handler: async (context, next) => {
      const { request, response } = context;
      const params = qs.parse(request.querystring);

      // Validation
      if (params.filter) {
        const isValid = ajv.validate('filter', params.filter);

        if (!isValid) {
          response.status = 400;
          response.body = ajv.errorsText();

          return next();
        }
      }

      const filter  = params.filter ? new Map(toPairs(params.filter)) : null;
      const geoNear = params.geoNear || null;
      const options = { filter, geoNear };

      if (request.query.page) {
        options.page = request.query.page;
      }

      if (request.query.sort) {
        options.sortBy = request.query.sort;
      }

      return station.list(options)
        .then(results => {
          const links     = {};
          const prevPage  = (results.currentPage - 1) || null;
          const nextPage  = (results.currentPage + 1) === results.pageCount ? null : results.currentPage + 1;
          const lastPage  = results.pageCount;
          const endpoint  = `${context.protocol}://${context.host}${context.path}`;

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
            response.headers.Link = formatLinkHeader(links);
          }

          response.status = 200;
          response.body = results.stations;
        })
        .catch(err => {
          response.status = 500;
        });
    }
  },

  {
    path: '/stations/:title',
    handler: async (context, next) => {
      const { response, params } = context;

      return station.fetch(params.title)
        .then(result => {
          if (result) {
            response.body = result;
          } else {
            response.status = 404;
          }
        })
        .catch((err) => {
          response.status = 500;
          response.body = err.message;
        });
    }
  },

  {
    path: '/stations/:title/stream',
    handler: async (context, next) => {
      const { response, params } = context;

      return station.fetchStream(params.title)
        .then(streamURL => {
          response.body = streamURL;
        })
        .catch(err => {
          response.status = 500;
          response.body = err.message;
        });
    }
  }
];
