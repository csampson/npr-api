/**
 * @overview Logger interface
 * @module   logger
 * @requires bunyan
 */

'use strict'

const bunyan = require('bunyan')

module.exports = bunyan.createLogger({ name: 'open-public-radio' })
