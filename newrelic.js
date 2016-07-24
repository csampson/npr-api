const environment = require('./lib/environment');

'use strict';

module.exports.config = {
  app_name: ['public-radio-api-dev'],
  license_key: environment.get('new_relic_key'),
  logging: {
    level: 'info'
  }
};
