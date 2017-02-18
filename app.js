/* eslint global-require: off */

/**
 * @overview  Application entry-point
 * @module    app
 * @requires  hapi
 * @requires  logger
 * @requires  newrelic
 * @requires  routes
 */

'use strict';

/**
 * Hooks Newrelic monitoring up from this point forward
 * @see {@link https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration/install-nodejs-agent}
 */

if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

const Hapi   = require('hapi');
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
server.route(routes);
server.start(init);
