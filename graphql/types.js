'use strict'

const { gql } = require('apollo-server')

module.exports = gql`
  type URL {
    href: String!
    rel: String
    title: String
  }

  type URLs {
    brand: [URL]
    donate: [URL]
    podcast: [URL]
    programming: [URL]
    streams: [URL]
  }

  type Station {
    id: String!
    address: String,
    band: String!,
    callsign: String!,
    fax: String,
    frequency: Float!,
    logo: String,
    market_city: String!,
    market_state: String!,
    name: String!,
    phone: Int,
    phone_extension: Int,
    tagline: String
    urls: URLs!
  }

  type Query {
    stations(query: String): [Station]
  }
`
