/* eslint-env mocha */

'use strict'

const Station = require('./station')

const test = {}
let station
let operation

test.values = new Map()
  .set('station-stringified', '{ "title": "<title>" }')
  .set('stations-stringified', ['{ "title": "<title>" }', '{ "title": "<title>" }'])
  .set('titles', ['station:<title>', 'station:<title>'])
  .set('error', new Error())
  .set('#fetch-resolved', { title: '<title>' })
  .set('#list-resolved', { currentPage: 1, stations: [{ title: '<title>' }, { title: '<title>' }], pageCount: 1 })
  .set('#list-resolved-with-sorting', { currentPage: 1, stations: [{ title: '<title>' }, { title: '<title>' }], pageCount: 1 })
  .set('#list-resolved-with-filtering', { currentPage: 1, stations: [{ title: '<title>' }, { title: '<title>' }], pageCount: 1 })

test.scenarios = new Map()
  .set('#fetch', () => {
    const execute = global.sandbox.stub()
    const database = { execute }

    execute.withArgs('get').resolves(test.values.get('station-stringified'))

    station = new Station(database)
    operation = station.fetch('<title>')

    return operation
  })
  .set('#fetch-error', () => {
    const execute = global.sandbox.stub()
    const database = { execute }

    execute.withArgs('get').rejects(test.values.get('error'))

    station = new Station(database)
  })
  .set('#list', () => {
    const execute = global.sandbox.stub()
    const database = { execute }

    execute.withArgs('mget').resolves(test.values.get('stations-stringified'))
    execute.withArgs('multi').resolves([2, test.values.get('titles')])

    station = new Station(database)
    operation = station.list()

    return operation
  })
  .set('#list-with-sortBy', () => {
    const execute = global.sandbox.stub()
    const database = { execute }

    execute.withArgs('mget').resolves(test.values.get('stations-stringified'))
    execute.withArgs('multi').resolves([2, test.values.get('titles')])

    station = new Station(database)
    operation = station.list({ sortBy: 'title' })

    return operation
  })
  .set('#list-with-filter', () => {
    const execute = global.sandbox.stub()
    const database = { execute }

    execute.withArgs('mget').resolves(test.values.get('stations-stringified'))
    execute.withArgs('multi').resolves([2, test.values.get('titles')])

    station = new Station(database)
    operation = station.list({ filter: new Map().set('band', 'am') })

    return operation
  })

describe('Station', () => {
  describe('#fetch', () => {
    context('when successful', () => {
      beforeEach(test.scenarios.get('#fetch'))

      it('should execute redis `GET` for the station', () => (
        station.database.execute.should.have.been.calledWithExactly('get', 'station:<title>')
      ))

      it('should resolve with a station', () => (
        operation.should.eventually.become(test.values.get('#fetch-resolved'))
      ))
    })

    context('when unsuccessful', () => {
      beforeEach(test.scenarios.get('#fetch-error'))

      it('should reject with an error', () => (
        station.fetch('<title>').should.be.rejectedWith(Error)
      ))
    })
  })

  describe('#list', () => {
    context('when given no options', () => {
      beforeEach(test.scenarios.get('#list'))

      it('should execute redis `MGET` for stations', () => (
        station.database.execute.should.have.been.calledWithExactly('mget', [
          'station:<title>',
          'station:<title>'
        ])
      ))

      it('should resolve with results', () => (
        operation.should.eventually.become(test.values.get('#list-resolved'))
      ))
    })

    context('when sorting is applied', () => {
      beforeEach(test.scenarios.get('#list-with-sortBy'))

      it('should execute redis `MGET` for stations', () => (
        station.database.execute.should.have.been.calledWithExactly('mget', [
          'station:<title>',
          'station:<title>'
        ])
      ))

      it('should resolve with results', () => (
        operation.should.eventually.become(test.values.get('#list-resolved-with-sorting'))
      ))
    })

    context('when filtering is applied', () => {
      beforeEach(test.scenarios.get('#list-with-filter'))

      it('should execute redis `MGET` for stations', () => (
        station.database.execute.should.have.been.calledWithExactly('mget', [
          'station:<title>',
          'station:<title>'
        ])
      ))

      it('should resolve with results', () => (
        operation.should.eventually.become(test.values.get('#list-resolved-with-filtering'))
      ))
    })

    context('when pagination is applied', () => {

    })

    context('when both sorting and filtering are applied', () => {

    })

    context('when sorting, filtering, and pagination are applied', () => {

    })

    context('when the result has already been stored', () => {

    })

    context('when unsuccessful', () => {

    })
  })

  xdescribe('#fetchStream', () => {

  })
})
