'use strict'

const _ = require('lodash/fp')

module.exports = function normalizeUrls(pageUrl, urls) {

  urls = _.filter(x => x !== undefined, urls)

  // Ensure all urls contain a domain name.
  //
  // For the sake of simplicity, character matching is used.
  // A regex would be more suitable to split the string into
  // parts and thoroughly analyze the url.
  urls = _.map(x => {

    // Unnecessary for the project scope:
    // - query params
    // - on-page links
    // - trailing slash
    if (x.indexOf('?') > -1) {
      x = x.substr(0, x.indexOf('?'))
    }

    if (x.indexOf('#') > -1) {
      x = x.substr(0, x.indexOf('#'))
    }

    if (x[x.length - 1] === '/') {
      x = x.substr(0, x.length - 1)
    }
    // On page links
    if (x[0] === '/') {
      x = pageUrl + x
    }

    return x
  }, urls)

  urls = _.filter(x => x !== '', urls)

  // Remove duplicates
  urls = _.uniq(urls)

  return urls
}
