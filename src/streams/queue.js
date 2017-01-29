'use strict'

const most = require('most')
const _ = require('lodash/fp')

module.exports = emitter =>
  most
    .fromEvent('queue', emitter)
    .filter(x => x.length > 0)
    .map(_.take(1))
    .delay(2000)
