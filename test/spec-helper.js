/* eslint-env mocha */

'use strict';

const chai  = require('chai');
const sinon = require('sinon');

require('sinon-as-promised');

chai.should();
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

/**
 * Sinon mocking sandbox
 */
const sandbox = sinon.sandbox.create();

afterEach(() => {
  // restore all the things made through the sandbox
  sandbox.restore();
});

global.sinon   = sinon;
global.sandbox = sandbox;
