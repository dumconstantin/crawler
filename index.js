'use strict'
const most = require('most')
const cheerio = require('cheerio')
const request = require('request-promise')
const EventEmitter = require('events')
const emitter = new EventEmitter()
const Promise = require('bluebird')
const _ = require('lodash/fp')

let startURL

function stripUrls($, selector, prop) {
  let urls = $(selector)
    .toArray()
    .map(x => $(x).attr(prop))

  return urls
}

const normalizeUrls = _.map(x => {
  if (x[0] === '/') {
    x = startURL + x
  }
  return x
})

const retrieveUrls = _.pipe(
  stripUrls,
  normalizeUrls
  // categorizeUrls
)

const resolveUrl = x => most.fromPromise(request({
  url: x,
  transform: body => ({
    url: x,
    $: cheerio.load(body)
  })
}))

const stream = most
  .fromEvent('url', emitter)
  .chain(resolveUrl)
  .map(x => {
    let hrefs = retrieveUrls(x.$, 'a', 'href')
    let img = retrieveUrls(x.$, 'img', 'src')

    // hrefs = categorizeHrefs(hrefs)

    let result = {
      parent: x.url,
      hrefs,
      src: {
        img
      }
    }

    return result
  })

stream
  .subscribe({
    next: x => console.log('Data', x),
    complete: x => console.log('Finished', x),
    error: x => console.error('Error', x)
  })


// Get the first argument as the startURL
process.argv.forEach(function (val, index, array) {
  if (index === 2) {
    startURL = val
    emitter.emit('url', startURL)
  }
})

