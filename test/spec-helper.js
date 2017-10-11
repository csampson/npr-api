/* eslint-env mocha */

'use strict'

const chai = require('chai')
const sinon = require('sinon')
const logger = require('../lib/logger')

require('sinon-as-promised')

chai.should()
chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))

sinon.stub(logger, 'error')

global.sandbox = sinon.sandbox.create()

afterEach(() => {
  global.sandbox.restore()
})
