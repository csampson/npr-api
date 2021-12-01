/**
 * @overview Sync static station data w/ the latest from NPR's API
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { omit, pick, snakeCase, transform } = require('lodash')

const STATION_FINDER_URL = 'https://www.npr.org/proxy/stationfinder/v3/stations'

let stations = []
const records = []

const stationsJSON = fs.readFileSync(path.join(__dirname, '../data/stations.json'))
stations = JSON.parse(stationsJSON.toString('utf8'))

function snakeCaseKeys (obj) {
  return transform(obj, (result, value, key) => {
    result[snakeCase(key)] = value
  })
}

// snake_case keys and prune `guid` and `type_id` from link objects
function transformLink (link) {
  return omit(snakeCaseKeys(link), ['guid', 'type_id'])
}

function wait (args) {
  // wait a few  seconds, to avoid being throtted
  console.info('[waiting]')

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.info('[resuming]')
      resolve(args)
    }, 2000)
  })
}

function fetchStation (station) {
  console.info('Fetching latest data for: ', station.callsign)

  return axios.get(STATION_FINDER_URL, {
    params: { q: station.callsign },
    headers: { Referer: 'https://www.npr.org', Origin: 'https://www.npr.org' }
  }).then(response => {
    if (!response.data.items.length) {
      return null
    }

    const { attributes, links } = response.data.items[0]

    return {
      ...pick(station, [
        'address',
        'band',
        'callsign',
        'fax',
        'frequency',
        'geolocation', // TODO: geolocation lookup, when needed
        'id',
        'logo',
        'market_city',
        'market_state',
        'name',
        'phone',
        'phone_extension'
      ]),
      tagline: attributes.brand.tagline,
      links: {
        brand: links.brand?.map(transformLink) || [],
        donation: links.donation?.map(transformLink) || [],
        podcasts: links.podcasts?.map(transformLink) || [],
        streams: links.streams?.map(transformLink) || []
      }
    }
  }).catch(error => {
    console.error(`Failed to update ${station.callsign}:`, error)
  })
}

stations.reduce((prev, station) => (
  prev.then(async () => {
    const data = await fetchStation(station)

    if (!data || !data.links.streams.length) {
      console.warn('No streams found for:', station.callsign)
      return wait()
    }

    records.push(data)

    return wait()
  })
), Promise.resolve())
  .then(() => {
    console.info('Saving...')
    fs.writeFileSync(path.join(__dirname, '../data/stations.json'), JSON.stringify(records))
  })
  .catch(console.error)
