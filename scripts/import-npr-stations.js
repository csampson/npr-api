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

const STATES = new Set(['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District Of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']);

function raise(err) {
  throw new Error(err);
}

function fetchStations(states) {
  const operations = states.map(state => {
    console.log(`Fetching stations for ${state}`);

    const endpoint = `http://api.npr.org/v2/stations/search/${state.toLowerCase()}?apiKey=${NPR_API_KEY}`;
    return axios.get(endpoint).then(response => response.data);
  });

  return Promise.all(operations);
}

function deserializeStations(states) {
  const stations = states.reduce((prev, curr, index) => {
    return curr.concat(prev); 
  }, []);
  
  console.log(stations.filter(station => {
    return station.urls.find(s => s.primary_stream === 1);
  }).length);

  return stations.filter(station => {
    return station.urls.find(s => s.primary_stream === 1);
  }).map(station => {
    const primaryStream = station.urls.find(s => s.primary_stream === 1);

    console.log(`Deserializing ${station.title}`);

    return {
      name            : station.name,
      title           : station.title,
      abbreviation    : station.abbreviation,
      call            : station.call,
      frequency       : +station.frequency,
      band            : station.band,
      tagline         : station.tagline,
      address         : station.address,
      market_city     : station.market_city,
      market_state    : station.market_state,
      format          : station.format,
      status          : station.status_name,
      area_code       : station.area_code,
      phone           : station.phone,
      phone_extension : station.phone_extension,
      fax             : station.fax,
      stream_url      : primaryStream ? primaryStream.href : null,
      homepage        : station.homepage,
      donation_url    : station.donation_url,
      logo            : station.logo
    };
  });
}

function fetchGeolocation(station) {
  const address = station.address.join('+');
  console.log(`Fetching geolocation for ${station.name}: ${address}`);

  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_API_KEY}`).then(response => {
    const geometry = response.data.results[0].geometry;

    return Object.assign(station, {
      geolocation: { longitude: geometry.location.lng, latitude: geometry.location.lat }
    });
  }).catch(raise);
}

function fetchGeolocations(stations) {
  const iterator   = new Set(stations).values();
  const operations = [];

  let index = 0;

  return new Promise((resolve, reject) => {
    const fetcher = setInterval(() => {
      const iteration = iterator.next();
      
      if (iteration.done) {
        resolve(Promise.all(operations));
        return clearInterval(fetcher);
      }
      
      operations.push(fetchGeolocation(iteration.value));
      index++;
    }, 250);
  });
}

function saveStations(stations) {
  console.log(stations.length);
  fs.writeFileSync(path.join(__dirname, '../data/stations.json'), JSON.stringify(stations));
  console.log('Completed saving station records to `../data/stations.json`');
}

fetchStations([...STATES])
  .then(deserializeStations)
  .then(fetchGeolocations)
  .then(saveStations)
  .catch(raise);
