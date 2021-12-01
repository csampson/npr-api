'use strict'

const { gql } = require('apollo-server')

module.exports = gql`
  type Link {
    href: String!
    rel: String
    title: String
  }

  type Links {
    brand: [Link]
    donate: [Link]
    podcast: [Link]
    programming: [Link]
    streams: [Link]
  }

  type Station {
    id: String!
    address: String,
    band: String!,
    callsign: String!,
    fax: String,
    frequency: Float!,
    geolocation: String,
    logo: String,
    market_city: String!,
    market_state: String!,
    name: String!,
    phone: Int,
    phone_extension: Int,
    tagline: String
    links: Links!
  }

  type Query {
    stations: [Station]
  }
`
