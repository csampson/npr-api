/* eslint-env mocha */

'use strict'

const redis = require('redis')

const Database = require('./database')

describe('Database', () => {
  const client = { send_command: global.sandbox.stub() }
  let database

  beforeEach(() => {
    global.sandbox.stub(redis, 'createClient').returns(client)
    database = new Database()
  })

  describe('constructor', () => {
    it('should create and store a redis client instance', () => (
      database.client.should.equal(client)
    ))
  })

  describe('#execute', () => {
    let execution

    beforeEach(() => {
      global.sandbox.spy(database.client.send_command)
      execution = database.execute('get', ['<key>'])
    })

    it('should call the underlying client method', () => (
      client.send_command.should.have.been.calledWith('get', ['<key>'])
    ))

    it('should be promisified', () => (
      execution.should.be.a('Promise')
    ))
  })
})
