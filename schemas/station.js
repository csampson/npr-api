/**
 * @overview API `station` object schema
 * @module   station
 * @requires joi
 */

'use strict';

const Joi = require('joi');

const station = Joi.object().keys({
  abbreviation: Joi.string(),
  band: Joi.string(),
  call: Joi.string(),
  format: Joi.string(),
  frequency: Joi.number(),
  geolocation: Joi.array().items(Joi.number()),
  market_city: Joi.string(),
  market_state: Joi.string(),
  name: Joi.string(),
  tagline: Joi.string(),
  title: Joi.string()
});

module.exports = station;
