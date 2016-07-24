/* eslint-env mocha */

'use strict';

const rethinkdb = require('rethinkdb');
const database  = require('./database');

describe('database', () => {
  describe('::connect', () => {
    it('should return a [Promise]', () => {
      return database.connect().should.be.resolved;
    });
  });
});
