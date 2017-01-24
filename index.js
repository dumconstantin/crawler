'use strict'
const most = require('most')
const cheerio = require('cheerio')
const request = require('request-promise')
const EventEmitter = require('events')
const emitter = new EventEmitter()
const Promise = require('bluebird')
const _ = require('lodash/fp')

let startUrl
let urls = []
let linking = []

function getProps($, selector, prop) {
  return $(selector)
    .toArray()
    .map(x => $(x).attr(prop))
}

function normalizeUrls(pageUrl, urls) {


  // Ensure all urls contain a domain name.
  //
  // For the sake of simplicity, character matching is used.
  // A regex would be more suitable to split the string into
  // parts and thoroughly analyze the url.
  urls = urls.map(x => {

    // Unnecessary for the project scope:
    // - query params
    // - on-page links
    // - trailing slash
    if (x.indexOf('?') >= 0) {
      x = x.substr(0, x.indexOf('?'))
    }

    if (x.indexOf('#') >= 0) {
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
  })

  urls = urls.filter(x => x !== '')

  // Remove duplicates
  urls = _.uniq(urls)

  return urls
}

function categorizeUrls(urls) {
  return urls.reduce((acc, x) => {

    if (x.indexOf(startUrl) >= 0) {
      acc.inbound.push(x)
    } else {
      acc.outbound.push(x)
    }

    return acc
  }, {
    inbound: [],
    outbound: []
  })
}

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
    let links = getProps(x.$, 'a', 'href')

    links = normalizeUrls(x.url, links)
    links = categorizeUrls(links)

    // let img = getProps(x.$, 'img', 'src')
    let img = []

    let result = {
      page: x.url,
      links,
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


// Get the first argument as the startUrl
process.argv.forEach(function (val, index, array) {
  if (index === 2) {
    startUrl = val
    emitter.emit('url', startUrl)
  }
})

