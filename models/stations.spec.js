/* eslint-env mocha */

'use strict';

const rethinkdb = require('rethinkdb');
const sinon     = require('sinon');
const Stations  = require('./stations');

const sandbox      = sinon.sandbox.create();
const mockStations = [
  { title: '<title>' }
];

function setupSandbox(options) {
  const database = {};

  if (options.succeed) {
    database.run = sinon.stub().resolves({
      toArray: sinon.stub().resolves(mockStations)
    });
  } else {
    database.run = sinon.stub().rejects();
  }

  sandbox.stub(rethinkdb, 'connect').resolves();
  sandbox.stub(rethinkdb, 'table').returns(database);
}

describe('Stations', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('#fetch', () => {
    it('should resolve with an [Array] of stations', () => {
      setupSandbox({ succeed: true });
      return Stations.fetch().should.eventually.become(mockStations);
    });

    it('should reject with an [Error] if the database query fails', () => {
      setupSandbox({ succeed: false });
      return Stations.fetch().should.eventually.be.rejectedWith(Error);
    });
  });
});
