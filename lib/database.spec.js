/* eslint-env mocha */

'use strict';

const redis = require('redis');

const Database = require('./database');

describe('Database', () => {
  let database;
  let client;

  beforeEach(() => {
    client = {
      get: global.sandbox.stub()
    };

    database = new Database();
    global.sandbox.stub(redis, 'createClient').returns(client);
  });

  describe('#connect', () => {
    let options;

    beforeEach(() => {
      options = {};
      database.connect(options);
    });

    it('should create and store a new redis client instance', () => (
      redis.createClient.should.have.been.calledWith(options)
    ));

    it('should store a redis client instance', () => (
      database.client.should.equal(client)
    ));
  });

  xdescribe('#execute', () => {

  });
});
