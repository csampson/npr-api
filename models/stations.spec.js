/* eslint-env mocha */

'use strict';

const rethinkdb = require('rethinkdb');
const sinon     = require('sinon');
const Stations  = require('./stations');

const sandbox = sinon.sandbox.create();
const mocks   = {
  normalizedStations: [
    { title: '<title>',  geolocation: { type: 'Point', coordinates: [90, -90] } }
  ],
  rawStations: [
    { title: '<title>', geolocation: { type: 'Point', coordinates: [90, -90], __raw_field__: null } }
  ]
};

function setupSandbox(options = {}) {
  const database = {};

  options = Object.assign({
    stations: mocks.normalizedStations,
    succeed: true
  }, options);

  if (options.succeed) {
    database.slice = sinon.stub().returns({
      run: sinon.stub().resolves({
        toArray: sinon.stub().returns(options.stations)
      })
    });

    sandbox.stub(rethinkdb, 'connect').resolves({});
  } else {
    database.slice = sinon.stub().returns({
      run: sinon.stub().rejects()
    });

    sandbox.stub(rethinkdb, 'connect').rejects();
  }

  sandbox.stub(rethinkdb, 'table').returns(database);
}

describe('Stations', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('::fetch', () => {
    it('should resolve with an [Array] of stations', () => {
      setupSandbox();
      return Stations.fetch().should.eventually.become(mocks.normalizedStations);
    });

    context('when the database connection fails', () => {
      it('should reject with an [Error]', () => {
        setupSandbox({ succeed: false });
        return Stations.fetch().should.eventually.be.rejectedWith(Error);
      });
    });

    context('when a station object includes the `geolocation` property', () => {
      it('should normalize `geolocation`', () => {
        setupSandbox({ stations: mocks.rawStations });
        return Stations.fetch().should.eventually.become(mocks.normalizedStations);
      });
    });
  });
});
