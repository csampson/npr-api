/* eslint-env mocha */

'use strict';

const sinon    = require('sinon');
const database = require('../lib/database');
const Station  = require('./station');

const sandbox = sinon.sandbox.create();
const mocks   = {
  normalizedStations: [
    { title: '<title>',  geolocation: { type: 'Point', coordinates: [90, -90] } }
  ],
  rawStations: [
    { title: '<title>', geolocation: { type: 'Point', coordinates: [90, -90], __raw_field__: null } }
  ]
};

let db;

function setupSandbox(options = {}) {
  options = Object.assign({
    result: mocks.normalizedStations,
    succeed: true
  }, options);

  if (options.succeed) {
    db = {
      run: sandbox.stub().resolves(
        Array.isArray(options.result)
          ? { toArray: sandbox.stub().resolves(options.result) }
          : options.result
      )
    };

    db.count   = sandbox.stub().returns(db);
    db.filter  = sandbox.stub().returns(db);
    db.get     = sandbox.stub().returns(db);
    db.orderBy = sandbox.stub().returns(db);
    db.slice   = sandbox.stub().returns(db);
    db.without = sandbox.stub().returns(db);

    sandbox.stub(database.interface, 'table').returns(db);
    sandbox.stub(database, 'connect').resolves({});
  } else {
    sandbox.stub(database, 'connect').rejects(Error);
  }
}

describe('Station', () => {
  beforeEach(() => {
    db = {};
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('::fetch', () => {
    it('should resolve with a station', () => {
      const station = mocks.normalizedStations[0];

      setupSandbox({ result: station });
      return Station.fetch('WWNO-FM').should.eventually.become(station);
    });
  });

  describe('::list', () => {
    it('should resolve with an [Array] of stations', () => {
      setupSandbox();

      return Station.list().should.eventually.become({
        pageCount: 1,
        currentPage: 1,
        stations: mocks.normalizedStations
      });
    });

    context('when the `sort` param is specified', () => {
      it('should sort by the given property', () => {
        setupSandbox();

        return Station.list({ sort: '<value>' }).then(res => (
          db.orderBy.should.have.been.calledWith('<value>')
        ));
      });
    });

    context('when the `filter` param is specified', () => {
      it('should filter by the given property', () => {
        const filter = new Map().set('<property>', '<value>');
        setupSandbox();

        return Station.list({ filter }).then(res => (
          db.filter.should.have.been.called
        ));
      });
    });

    xcontext('when a station object includes the `geolocation` property', () => {
      it('should normalize `geolocation`', () => {
        setupSandbox({ result: mocks.rawStations });

        return Station.list().should.eventually.become({
          pageCount: 1,
          currentPage: 1,
          stations: mocks.normalizedStations
        });
      });
    });

    context('when the database connection fails', () => {
      it('should reject with an [Error]', () => {
        setupSandbox({ succeed: false });
        return Station.list().should.eventually.be.rejectedWith(Error);
      });
    });
  });
});
