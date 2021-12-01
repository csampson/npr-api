'use strict'

const Database = require('../lib/database')
const Station = require('../models/station')

const database = new Database()
const station = new Station(database)

const resolvers = {
  Query: {
    stations: (obj, args) => (
      station.all()
    )
  }
}

module.exports = resolvers
