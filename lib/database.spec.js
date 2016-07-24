/* eslint-env mocha */

'use strict';

const rethinkdb = require('rethinkdb');
const database  = require('./database');

describe('database', () => {
  describe('::connect', () => {
    it('should return a [Promise]', () => (
      database.connect().should.be.resolved
    ));
  });

  describe('.interface', () => {
    it('should be a reference to rethinkdb', () => {
      database.interface.should.equal(rethinkdb);
    });
  });
});
