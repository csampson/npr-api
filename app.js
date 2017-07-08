/* eslint "global-require": "off" */

/**
 * @overview Application entry-point
 * @requires koa
 * @requires koa-router
 * @requires newrelic
 * @requires routes
 */

'use strict';

/**
 * Activates New Relic monitoring from this point forward
 */
if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

const Koa = require('koa');
const router = require('koa-router')();
const routes = require('./routes');

const app = new Koa();

routes.forEach((route) => {
  router.get(route.path, route.handler);
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.PORT || 3000);
