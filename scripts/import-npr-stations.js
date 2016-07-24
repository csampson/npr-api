/* eslint-disable no-console */

/**
 * @overview  Imports station objects from the NPR API v2
 * @module    import-npr-stations
 * @requires  axios
 * @requires  fs
 * @requires  path
 */

'use strict';

const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

const NPR_API_KEY    = process.env.NPR_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!NPR_API_KEY) {
  throw new Error('Missing required envrionment variable: `NPR_API_KEY`');
} else if (!GOOGLE_API_KEY) {
  throw new Error('Missing required envrionment variable: `GOOGLE_API_KEY`');
}

const STATES = new Set([
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District Of Columbia', 'Florida',
  'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
  'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']);

function raise(err) {
  throw new Error(err);
}

function fetchStations(state) {
  console.log(`Fetching stations for ${state}`);

  const urlPath  = encodeURIComponent(state);
  const endpoint = `http://api.npr.org/v2/stations/search/${urlPath}?apiKey=${NPR_API_KEY}`;

  return axios.get(endpoint).then(response => response.data);
}

function deserializeStations(stations) {
  return stations.map(station => {
    const primaryStream = station.urls.find(s => s.primary_stream === 1);

    console.log(`Deserializing ${station.title}`);

    return {
      name: station.name,
      title: station.title,
      abbreviation: station.abbreviation,
      call: station.call,
      frequency: +station.frequency,
      band: station.band,
      tagline: station.tagline,
      address: station.address,
      market_city: station.market_city,
      market_state: station.market_state,
      format: station.format,
      status: station.status_name,
      area_code: station.area_code,
      phone: station.phone,
      phone_extension: station.phone_extension,
      fax: station.fax,
      stream_url: primaryStream ? primaryStream.href : null,
      homepage: station.homepage,
      donation_url: station.donation_url,
      logo: station.logo
    };
  });
}

function fetchGeolocation(station) {
  const address = station.address.join('+');

  console.log(`Fetching geolocation for ${station.name}: ${address}`);

  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_API_KEY}`).then(response => {
    const geometry = response.data.results[0] ? response.data.results[0].geometry : { location: {} };

    return Object.assign(station, {
      geolocation: { longitude: geometry.location.lng, latitude: geometry.location.lat }
    });
  }).catch(raise);
}

function fetchGeolocations(stations) {
  const iterator   = new Set(stations).values();
  const operations = [];

  return new Promise((resolve, reject) => {
    const fetcher = setInterval(() => {
      const iteration = iterator.next();

      if (iteration.done) {
        resolve(Promise.all(operations));
        return clearInterval(fetcher);
      }

      return operations.push(fetchGeolocation(iteration.value));
    }, 250);
  });
}

function saveStations(stations, state) {
  const filename = `${state.toLowerCase().replace(' ', '-')}.json`;

  fs.writeFileSync(path.join(__dirname, `../data/${filename}`), JSON.stringify(stations));
  console.log(`Completed saving ${stations.length} station records to ../data/${filename}`);
}

[...STATES].reduce((prev, curr) => (
  prev.then(() => (
    fetchStations(curr)
    .then(deserializeStations)
    .then(fetchGeolocations)
    .then(stations => saveStations(stations, curr))
  )).catch(raise)
), Promise.resolve());
