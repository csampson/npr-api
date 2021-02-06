'use strict'

const { ApolloServer } = require('apollo-server')

const resolvers = require('./graphql/resolvers')
const types = require('./graphql/types')

const PORT = process.env.APOLLO_PORT || 3000

const server = new ApolloServer({
  typeDefs: types,
  resolvers
})

server.listen(PORT)
