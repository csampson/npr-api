/**
 * @overview Logger interface
 * @module   logger
 * @requires bunyan
 */

'use strict';

const bunyan   = require('bunyan');
const missing  = require('missing');

const foo = () => {};

for (var i = 0; i < 1; i++) {
  console.log('wut');
}

module.exports = bunyan.createLogger({ name: 'public-radio-api' });
