/* eslint-env jest */

'use strict'

const Station = require('./station')

describe('Station', () => {
  let database
  let station

  beforeEach(() => {
    database = { execute: jest.fn() }
    station = new Station(database)
  })

  describe('#search', () => {
    beforeEach(() => {
      database.execute.mockResolvedValue([
        '1',
        'station:WWNO-FM',
        [
          'callsign', 'WWNO',
          'market_city', 'New Orleans',
          'json', '{ "callsign": "WWNO", "market_city": "New Orleans" }'
        ]
      ])
    })

    it('should resolve to a set of stations', () => {
      return expect(station.search()).resolves.toEqual([
        { callsign: 'WWNO', market_city: 'New Orleans' }
      ])
    })
  })
})
