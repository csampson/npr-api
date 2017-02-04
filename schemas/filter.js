'use strict';

const Joi = require('joi');

const filter = Joi.object().keys({
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
    }),
    sort: Joi.string(),
    page: Joi.string()
}

module.exports = filter;
