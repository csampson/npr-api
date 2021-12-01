/**
 * @overview Loads station data into RediSearch
 */

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
  'links'
]

function createIndex () {
  console.info('Creating stations index')

  return database.client.ft.create('stations', {
    band: 'TEXT',
    callsign: 'TEXT',
    frequency: 'NUMERIC',
    geolocation: 'GEO',
    id: 'TEXT',
    market_city: 'TEXT',
    market_state: 'TEXT',
    name: 'TEXT'
  })
}

function loadStation (station) {
  const fields = {}

  console.info('Inserting:', station.id)

  attrs.forEach((attr) => {
    if (station[attr] !== null && station[attr] !== undefined) {
      let value

      if (attr === 'geolocation') {
        value = station[attr].join(',')
      } else if (attr === 'links') {
        value = JSON.stringify(station[attr])
      } else {
        value = station[attr]
      }

      if (value) {
        fields[attr] = value
      }
    }
  })

  return database.client.hSet(`station:${station.id}`, fields)
}

const database = new Database()
const stationsFile = fs.readFileSync(path.join(__dirname, '../data/stations.json'))
const stations = JSON.parse(stationsFile.toString('utf8'))

createIndex().then(() => {
  const operations = stations.map(loadStation)

  Promise.all(operations)
    .then(() => {
      console.info('Executing SAVE...')
      return database.client.save()
    })
    .then(() => {
      console.info('Done.')
      return database.client.quit()
    })
}).catch((error) => {
  console.error('Failed to import stations:', error)
})
