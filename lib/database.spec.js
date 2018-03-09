/* eslint-env jest */

'use strict'

jest.mock('redis', () => ({
  createClient: () => ({ send_command: jest.fn() })
}))

const Database = require('./database')

describe('Database', () => {
  let database

  beforeEach(() => {
    database = new Database()
  })

  describe('constructor', () => {
    test('should create and store a redis client instance', () => (
      expect(database.client).toBeDefined()
    ))
  })

  describe('#execute', () => {
    let execution

    beforeEach(() => {
      execution = database.execute('get', ['<key>'])
    })

    test('should call the underlying client method', () => (
      expect(database.client.send_command).toHaveBeenCalled()
    ))

    test('should be promisifed', () => (
      expect(execution).toBeInstanceOf(Promise)
    ))
  })
})
