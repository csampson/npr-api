/* eslint-env mocha */

'use strict';

const bunyan = require('bunyan');
const logger = require('./logger');

describe('logger', () => {
  it('should be an instance of bunyan', () => {
    logger.should.be.instanceOf(bunyan);
  });
});
