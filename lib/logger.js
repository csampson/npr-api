/**
 * @overview Logger interface
 */

'use strict'

const bunyan = require('bunyan')

module.exports = bunyan.createLogger({ name: 'open-public-radio' })
