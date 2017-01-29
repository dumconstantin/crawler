'use strict'

const _ = require('lodash/fp')

module.exports = function parseUrls(urls) {

  if (urls.length === 0) {
    return []
  }

  let root = urls[0]

  let props =_.reduce((acc, x) => {
    let y = {
      inbound: _.startsWith(root, x)
    }

    let ext = x.match(/\.([a-z0-9]+)$/i)

    y.type = ext ? ext[1] : 'html'

    acc[x] = y

    return acc
  }, {}, urls)

  return props
}
