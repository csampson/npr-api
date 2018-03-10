'use strict'

const Koa = require('koa')
const KoaRouter = require('koa-router')
const koaLogger = require('koa-bunyan-logger')
const koaBody = require('koa-bodyparser')
const { graphqlKoa, graphiqlKoa } = require('apollo-server-koa')
const { ApolloEngine } = require('apollo-engine')

const schema = require('./graphql/schema')

const app = new Koa()
const router = new KoaRouter()
const PORT = 3000

if (!process.env.APOLLO_ENGINE_KEY) {
  throw new Error('Missing required environment variable: APOLLO_ENGINE_KEY')
}

const engine = new ApolloEngine({
  apiKey: process.env.APOLLO_ENGINE_KEY,
  logging: {
    level: 'INFO' // Engine Proxy logging level. DEBUG, INFO (default), WARN or ERROR.
  }
})

router.post('/graphql', graphqlKoa({
  tracing: true,
  cacheControl: true,
  schema
}))

router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))

app.use(koaBody())
app.use(koaLogger())
app.use(koaLogger.requestIdContext())
app.use(koaLogger.requestLogger())
app.use(router.routes())
app.use(router.allowedMethods())

engine.listen({
  port: PORT,
  koaApp: app
})
