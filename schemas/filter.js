/**
 * @overview API `filter` object schema
 * @module   filter
 * @requires joi
 */

'use strict'

const Joi = require('joi')

const filter = Joi.object().keys({
  band: Joi.string(),
  call: Joi.string(),
  format: Joi.string(),
  frequency: Joi.number(),
  market_city: Joi.string(),
  market_state: Joi.string(),
  name: Joi.string(),
  title: Joi.string()
})

module.exports = filter
