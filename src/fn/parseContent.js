'use strict'

const _ = require('lodash/fp')

const getProps = require('./getProps')
const normalizeUrls = require('./normalizeUrls')

module.exports = _.curry(function parseContent(types, x){
  let urls = Object.keys(types).reduce((acc, y) => {
    acc = acc.concat(getProps(x.$, y, types[y]))
    return acc
  }, [])

  urls = normalizeUrls(x.url, urls)
  return {
    parent: x.url,
    urls
  }
})
