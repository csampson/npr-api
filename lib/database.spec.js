/* eslint-env jest */

'use strict'

jest.mock('redis', () => ({
  createClient: () => ({
    connect: jest.fn(),
    on: jest.fn()
  })
}))

const Database = require('./database')

describe('Database', () => {
  let database

  beforeEach(() => {
    database = new Database()
  })

  describe('constructor', () => {
    test('should create and store a redis client instance', () => {
      expect(database.client).toHaveProperty('connect')
    })
  })
})
