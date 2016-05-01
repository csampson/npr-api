/**
 * @overview  Application entry-point
 * @module    app
 * @requires  boom
 * @requires  hapi
 * @requires  routes
 */

'use strict';

const Boom   = require('boom');
const Hapi   = require('hapi');
const routes = require('./routes');

const server     = new Hapi.Server();
const connection = { port: process.env.APP_PORT || 3000 };

function init(err) {
  if (err) {
    throw new Error(err);
  }

  console.log(`Server running at: ${server.info.uri}`);
}

server.connection(connection);

server.route(routes);
server.start(init);
