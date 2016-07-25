/* eslint-env mocha */

'use strict';

const rethinkdb = require('rethinkdb');
const sinon     = require('sinon');
const database  = require('./database');

describe('database', () => {
  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    sandbox.stub(rethinkdb, 'connect').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('::connect', () => {
    it('should return a [Promise]', () => (
      database.connect().should.be.resolved
    ));
  });

  describe('.interface', () => {
    it('should be a reference to `rethinkdb`', () => {
      database.interface.should.equal(rethinkdb);
    });
  });
});
