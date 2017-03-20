/* eslint-env mocha */

'use strict';

const environment = require('./environment');
const nconf       = require('nconf');

xdescribe('environment', () => {
  it('should be a reference to `nconf`', () => {
    environment.should.equal(nconf);
  });
});
