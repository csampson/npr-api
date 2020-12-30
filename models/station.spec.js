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
        '10',
        'WWNO-FM',
        [
          'callsign', 'WWNO',
          'market_city', 'New Orleans',
          'urls', '{"title":"WWNO-FM 89.9"}'
        ]
      ])
    })

    it('should resolve to a set of stations', () => {
      expect(station.search()).resolves.toEqual([
        { callsign: 'WWNO', market_city: 'New Orleans', urls: { title: 'WWNO-FM 89.9' } }
      ])
    })
  })
})
