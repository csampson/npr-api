'use strict'

const { makeExecutableSchema } = require('graphql-tools')

const resolvers = require('./resolvers')
const types = require('./types')

module.exports = makeExecutableSchema({
  resolvers,
  typeDefs: types
})
