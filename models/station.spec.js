/* eslint-env jest */

'use strict'

const Station = require('./station')

describe('Station', () => {
  let database
  let station

  beforeEach(() => {
    database = {
      client: {
        ft: { search: jest.fn() }
      }
    }

    station = new Station(database)
  })

  describe('#all', () => {
    beforeEach(() => {
      database.client.ft.search.mockResolvedValue([
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
      return expect(station.all()).resolves.toEqual([
        { callsign: 'WWNO', market_city: 'New Orleans' }
      ])
    })
  })
})
