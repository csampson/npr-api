/**
 * @overview API `geoNear` object schema
 */

'use strict'

const Joi = require('joi')

const geoNear = Joi.object().keys({
  coordinates: Joi.array().items(Joi.number()),
  distance: Joi.number()
})

module.exports = geoNear
