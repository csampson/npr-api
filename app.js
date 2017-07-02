/* eslint "global-require": "off" */

/**
 * @overview  Application entry-point
 * @module    app
 * @requires  hapi
 * @requires  hapi-qs
 * @requires  logger
 * @requires  opbeat
 * @requires  routes
 */

'use strict';

/**
 * Hooks Opbeat monitoring up from this point forward
 * @see {@link https://opbeat.com/docs/articles/nodejs-agent-api/}
 */
if (process.env.NODE_ENV === 'production') {
  require('opbeat').start();
}

const Hapi   = require('hapi');
const HapiQS = require('hapi-qs');
const logger = require('./lib/logger');
const routes = require('./routes');

const server     = new Hapi.Server();
const connection = { port: process.env.PORT || 3000 };

function init(err) {
  if (err) {
    logger.fatal(err);
    throw new Error(err);
  }

  logger.info(`Server running at: ${server.info.uri}`);
}

server.connection(connection);
server.register(HapiQS);
server.route(routes);
server.start(init);
