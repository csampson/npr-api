/**
 * @overview Imports station objects from the NPR API v2
 */

'use strict'

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const snakeCase = require('lodash/snakeCase')

const NPR_API_KEY = process.env.NPR_API_KEY
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

if (!NPR_API_KEY) {
  throw new Error('Missing required envrionment variable: `NPR_API_KEY`')
} else if (!GOOGLE_API_KEY) {
  throw new Error('Missing required envrionment variable: `GOOGLE_API_KEY`')
}

// Maps NPR link `type_name` values to better organized metadata objects
const LINK_METADATA = new Map()
  .set('audio_aac_stream', { category: 'streams', rel: 'secondary_format_stream' })
  .set('audio_mp3_stream', { category: 'streams', rel: 'secondary_format_stream' })
  .set('audio_real_media_stream', { category: 'streams', rel: 'secondary_format_stream' })
  .set('audio_stream_landing_page', { category: 'brand', rel: 'listen_page' })
  .set('audio_windows_media_stream', { category: 'streams', rel: 'secondary_format_stream' })
  .set('facebook_url', { category: 'brand', rel: 'facebook_page' })
  .set('local_news', { category: 'brand', rel: 'local_news' })
  .set('newscast', { category: 'brand', rel: 'newscast' })
  .set('online_store', { category: 'brand', rel: 'online_store' })
  .set('organization_home_page', { category: 'brand', rel: 'home_page' })
  .set('pledge_page', { category: 'donate', rel: 'pledge_page' })
  .set('podcast', { category: 'podcasts', rel: 'podcast' })
  .set('program_schedule', { category: 'programming', rel: 'program_schedule' })
  .set('rss_feed', { category: 'programming', rel: 'rss_feed' })
  .set('station_id_mp3_audio', { category: 'brand', rel: 'station_id' })
  .set('twitter_feed', { category: 'brand', rel: 'twitter_feed' })

const STATES = new Set([
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District Of Columbia', 'Florida',
  'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
  'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'])

function wait (args) {
  // wait a few  seconds, to avoid being throtted
  console.log('[waiting]')

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('[resuming]')
      resolve(args)
    }, 3000)
  })
}

function raise (err) {
  throw new Error(err)
}

// NPR API uses `primary_stream` 0 or 1 instead of booleans
function toBoolean (value) {
  return value === 1
}

function toNumber (value) {
  return value ? Number(value) : null
}

function getUrls (station) {
  const urls = {
    brand: [],
    donate: [],
    podcasts: [],
    programming: [],
    streams: []
  }

  station.urls.forEach((url) => {
    const type = snakeCase(url.type_name).replace('mp_3', 'mp3')
    const metadata = LINK_METADATA.get(type)

    if (!LINK_METADATA.has(type)) {
      throw new Error(`Unknown station link type encountered: "${url.type_name}"`)
    }

    urls[metadata.category].push({
      href: url.href,
      rel: toBoolean(url.primary_stream) ? 'primary_format_stream' : metadata.rel,
      title: url.title
    })
  })

  // For stations with no known primary format stream, designate the first stream as primary
  if (urls.streams.length && !urls.streams.some(s => s.rel === 'primary_format_stream')) {
    urls.streams[0].rel = 'primary_format_stream'
  }

  return urls
}

function fetchStations (state) {
  console.log(`Fetching stations for ${state}`)

  const urlPath = encodeURIComponent(state)
  const endpoint = `http://api.npr.org/v2/stations/search/${urlPath}?apiKey=${NPR_API_KEY}`

  return axios.get(endpoint).then(response => response.data)
}

function deserializeStations (stations) {
  return stations.map(station => {
    console.log(`Deserializing ${station.title}`)

    return {
      address: station.address.join(' '),
      band: station.band,
      callsign: station.call,
      fax: toNumber(station.fax),
      format: snakeCase(station.format),
      frequency: toNumber(station.frequency),
      id: station.title,
      logo: station.logo,
      market_city: station.market_city,
      market_state: station.market_state,
      name: station.name,
      phone: toNumber(station.phone),
      phone_extension: toNumber(station.phone_extension),
      tagline: station.tagline,
      urls: getUrls(station)
    }
  })
}

function fetchGeolocation (station) {
  // Google expects + as the delmiter
  const address = station.address.replace(' ', '+')

  console.log(`Fetching geolocation for ${station.name}: ${address}`)

  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_API_KEY}`).then(response => {
    const results = response.data.results[0]

    if (results) {
      return Object.assign(station, {
        geolocation: `${results.geometry.location.lng},${results.geometry.location.lat}`
      })
    }

    return station
  }).catch(raise)
}

function fetchGeolocations (stations) {
  const iterator = new Set(stations).values()
  const operations = []

  return new Promise((resolve, reject) => {
    const fetcher = setInterval(() => {
      const iteration = iterator.next()

      if (iteration.done) {
        resolve(Promise.all(operations))
        return clearInterval(fetcher)
      }

      return operations.push(fetchGeolocation(iteration.value))
    }, 250)
  })
}

function saveStations (stations, state) {
  const filename = `${state.toLowerCase().replace(' ', '-')}.json`

  fs.writeFileSync(path.join(__dirname, `../data/${filename}`), JSON.stringify(stations))
  console.log(`Completed saving ${stations.length} station records to ../data/${filename}`)
}

[...STATES].reduce((prev, curr) => (
  prev.then(() => (
    fetchStations(curr)
      .then(deserializeStations)
      .then(wait)
      .then(fetchGeolocations)
      .then(wait)
      .then(stations => saveStations(stations, curr))
  )).catch(raise)
), Promise.resolve())
