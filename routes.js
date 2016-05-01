'use strict';

const Boom = require('boom');
const Joi  = require('joi');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply();
    }
  }
];
