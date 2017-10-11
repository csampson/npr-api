/* eslint-env mocha */

'use strict'

const redis = require('redis')

const Database = require('./database')

describe('Database', () => {
  let client

  beforeEach(() => {
    client = { get: global.sandbox.stub() }
    global.sandbox.stub(redis, 'createClient').returns(client)
  })

  describe('constructor', () => {
    let database

    beforeEach(() => {
      database = new Database()
    })

    it('should create and store a new redis client instance', () => (
      database.client.should.equal(client)
    ))
  })
})
