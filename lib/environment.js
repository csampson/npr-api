/**
 * @module   environment
 * @requires nconf
 */

'use strict';

const nconf = require('nconf');

module.exports = nconf
  .argv()
  .env()
  .file(`${__dirname}/secrets.json`);
