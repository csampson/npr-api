/* eslint-disable no-console */

/**
 * @overview Loads station data into Redis
 */

'use strict'

const fs = require('fs')
const path = require('path')
const sortBy = require('lodash/sortBy')

const Database = require('../lib/database')

function importStation (station) {
  const content = fs.readFileSync(`${__dirname}/../data/${station}`)
  return JSON.parse(content.toString('utf8'))
}

function createIndex () {
  return database.execute('FT.CREATE', [
    'stations',
    'SCHEMA',
    'address', 'TEXT',
    'band', 'TEXT',
    'callsign', 'TEXT',
    'fax', 'NUMERIC',
    'frequency', 'NUMERIC',
    'geolocation', 'GEO',
    'id', 'TEXT',
    'market_city', 'TEXT',
    'market_state', 'TEXT',
    'name', 'TEXT'
  ])
}

function loadStation (station) {
  const fields = []

  const attrs = [
    'address',
    'band',
    'call',
    'fax',
    'frequency',
    'geolocation',
    'logo',
    'market_city',
    'market_state',
    'name',
    'phone',
    'phone_extension',
    'tagline',
    'urls'
  ]

  // Prune nil values
  attrs.forEach((attr) => {
    if (station[attr] !== null && station[attr] !== undefined) {
      const value = attr === 'urls'
        ? JSON.stringify(station[attr])
        : station[attr]

      if (value) {
        fields.push(attr, value)
      }
    }
  })

  fields.push('id', station.title)

  return database.execute('FT.ADD', [
    'stations', station.title, 1, 'FIELDS'
  ].concat(fields))
}

const database = new Database()
const files = fs.readdirSync(path.join(__dirname, '../data'))
const stations = files.map(importStation).reduce((prev, current) => prev.concat(current), [])

database.client.on('error', (err) => {
  throw new Error(`Stations import failed: ${err}`)
})

console.log('Loading station records...')

createIndex().then(() => {
  const operations = sortBy(stations, 'title').map((station, index) => {
    /** @todo Clean up static station data */
    station.address = station.address.join(' ')

    if (station.geolocation.longitude !== undefined && station.geolocation.latitude !== undefined) {
      station.geolocation = `${station.geolocation.longitude},${station.geolocation.latitude}`
    } else {
      delete station.geolocation
    }

    return loadStation(station)
  })

  Promise.all(operations)
    .then(() => {
      console.log('Done.')
      database.client.quit()
    })
    .catch((err) => {
      console.error(err)
    })
}).catch((error) => {
  console.error(`Failed to create index: ${error}`)
})
