/**
 * @overview Loads station data into Redis
 */

'use strict'

const fs = require('fs')
const path = require('path')

const Database = require('../lib/database')

const attrs = [
  'address',
  'band',
  'callsign',
  'fax',
  'frequency',
  'geolocation',
  'id',
  'logo',
  'market_city',
  'market_state',
  'name',
  'phone',
  'phone_extension',
  'tagline',
  'urls'
]

const indexes = {
  'band': 'TEXT',
  'callsign': 'TEXT',
  'frequency': 'NUMERIC',
  'geolocation': 'GEO',
  'id': 'TEXT',
  'market_city': 'TEXT',
  'market_state': 'TEXT',
  'name': 'TEXT'
}

function importStation (station) {
  const content = fs.readFileSync(path.join(__dirname, `../data/${station}`))
  return JSON.parse(content.toString('utf8'))
}

function createIndex () {
  const schema = Object.keys(indexes).reduce((prev, curr) => (
    prev.concat(curr, indexes[curr])
  ), [])

  return database.execute('FT.CREATE', [
    'stations',
    'ON',
    'HASH',
    'PREFIX',
    '1',
    'station:',
    'SCHEMA',
  ].concat(schema))
}

function loadStation (station, index) {
  const args = []

  // Add non-nil values to HSET args
  attrs.forEach((attr) => {
    if (attr in indexes && station[attr] !== null && station[attr] !== undefined) {
      args.push(attr, station[attr])
    }
  })

  return database.execute('HSET', [
    `station:${index+1}`,
  ].concat(args, ['json', JSON.stringify(station)]))
}

const database = new Database()
const files = fs.readdirSync(path.join(__dirname, '../data'))
const stations = files.map(importStation).reduce((prev, current) => prev.concat(current), [])

database.client.on('error', (err) => {
  throw new Error(`Stations import failed: ${err}`)
})

console.log('Loading station records...')

createIndex().then(() => {
  const operations = stations.map((station, index) => (
    loadStation(station, index)
  ))

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
