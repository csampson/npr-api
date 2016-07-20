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

let database;

function setupSandbox(options = {}) {
  options = Object.assign({
    stations: mocks.normalizedStations,
    succeed: true
  }, options);

  if (options.succeed) {
    database = {
      run: sandbox.stub().resolves({
        toArray: sandbox.stub().returns(options.stations)
      })
    };

    database.filter  = sandbox.stub().returns(database);
    database.orderBy = sandbox.stub().returns(database);
    database.slice   = sandbox.stub().returns(database);

    sandbox.stub(rethinkdb, 'table').returns(database);
    sandbox.stub(rethinkdb, 'connect').resolves({});
  } else {
    sandbox.stub(rethinkdb, 'connect').rejects(Error);
  }
}

describe('Stations', () => {
  beforeEach(() => {
    database = {};
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('::fetch', () => {
    it('should resolve with an [Array] of stations', () => {
      setupSandbox();
      return Stations.fetch().should.eventually.become(mocks.normalizedStations);
    });

    context('when the `sort` param is specified', () => {
      it('should sort by the given property', () => {
        setupSandbox();
        return Stations.fetch({ sort: '<value>' }).then(res => (
          database.orderBy.should.have.been.calledWith('<value>')
        ));
      });
    });

    context('when the `filter` param is specified', () => {
      it('should filter by the given property', () => {
        const filter = new Map().set('<property>', '<value>');
        setupSandbox();

        return Stations.fetch({ filter }).then(res => (
          database.filter.should.have.been.called
        ));
      });
    });

    context('when a station object includes the `geolocation` property', () => {
      it('should normalize `geolocation`', () => {
        setupSandbox({ stations: mocks.rawStations });
        return Stations.fetch().should.eventually.become(mocks.normalizedStations);
      });
    });

    context('when the database connection fails', () => {
      it('should reject with an [Error]', () => {
        setupSandbox({ succeed: false });
        return Stations.fetch().should.eventually.be.rejectedWith(Error);
      });
    });
  });
});
