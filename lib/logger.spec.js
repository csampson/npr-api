/* eslint-env jest */

'use strict'

const bunyan = require('bunyan')
const logger = require('./logger')

describe('logger', () => {
  test('should be an instance of bunyan', () => {
    expect(logger).toBeInstanceOf(bunyan)
  })
})
