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

const NPR_API_KEY = process.env.NPR_API_KEY;

if (!NPR_API_KEY) {
  throw new Error('Missing required envrionment variable: `NPR_API_KEY`');
}

const STATES     = new Set(['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District Of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']);
const operations = [];

function deserialize(station) {
  const primaryStream = station.urls.find(s => s.primary_stream === 1);

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
}

function fetch(state) {
  console.log(`Fetching stations for ${state}`);

  const endpoint = `http://api.npr.org/v2/stations/search/${state.toLowerCase()}?apiKey=${NPR_API_KEY}`;
  return axios.get(endpoint).then(response => response.data);
}

for (const state of STATES) {
  operations.push(fetch(state));  
}

Promise.all(operations)
  .then(states => {
    const results = states.map(stations => {
      return stations.map(deserialize);
    });

    const allStations = results.reduce((prev, curr, index) => {
      return curr.concat(prev); 
    }, []);

    fs.writeFileSync(path.join(__dirname, '../data/stations.json'), JSON.stringify(allStations));

    console.log('Completed saving station records to `../data/stations.json`');
  })
  .catch(err => {
    throw new Error(err);
  });
