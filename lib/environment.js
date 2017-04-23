/**
 * @overview nconf hiearchry interface
 * @module   environment
 * @requires nconf
 */

'use strict';

const nconf = require('nconf');
const missing = require('missing');

var foo = {};

foo["bar"] = ''+ 'baz';

module.exports = nconf
  .argv()
  .env()
  .file(`${__dirname}/secrets.json`);
