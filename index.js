'use strict'
const most = require('most')
const cheerio = require('cheerio')
const request = require('request-promise')
const EventEmitter = require('events')
const emitter = new EventEmitter()
const Promise = require('bluebird')
const _ = require('lodash/fp')
const fs = require('fs')

let startUrl
let urls = []
let linking = []

function getProps($, selector, prop) {
  return $(selector)
    .toArray()
    .map(x => $(x).attr(prop))
}

function normalizeUrls(pageUrl, urls) {

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

function prepareUrls(urls) {
  urls =_.reduce((acc, x) => {
    let y = {
      url: x,
      props: {
        inbound: _.startsWith(startUrl, x)
      }
    }

    let ext = x.match(/\.([a-z0-9]+)$/i)

    y.props.type = ext ? ext[1] : 'html'

    acc.push(y)

    return acc
  }, [], urls)

  return urls
}

function getUrlContent(x) {
  return most.fromPromise(request({
    url: x,
    transform: body => ({
      url: x,
      $: cheerio.load(body)
    })
  }))
}

let types = {
  a: 'href',
  img: 'src',
  script: 'src',
  link: 'href'
}

const parseContent = _.curry((types, x) => {
  let urls = Object.keys(types).reduce((acc, y) => {
    acc = acc.concat(getProps(x.$, y, types[y]))
    return acc
  }, [])

  urls = normalizeUrls(x.url, urls)
  urls = prepareUrls(urls)
  return {
    parent: x.url,
    urls
  }
})

const queueing = most
  .fromEvent('queue', emitter)
  .filter(x => x.length > 0)
  .map(_.take(1))
  .forEach(x => {
    console.log('queueing', x)
    emitter.emit('crawl', x[0])
  })

const crawler = most
  .fromEvent('crawl', emitter)
  .chain(getUrlContent)
  .map(parseContent(types))
  .scan((a, b) => {

    let j
    if (a.urls.length === 0) {
      a.urls.push(b.parent)
      a.crawled.push(b.parent)

      a.props[b.parent] = {
        inbound: true,
        type: 'html'
      }
      j = 0
    } else {
      j = a.urls.indexOf(b.parent)
      a.crawled.push(b.parent)
    }

    while (b.urls.length > 0) {
      let x = b.urls.shift()

      if (a.urls.indexOf(x.url) === -1) {
        a.urls.push(x.url)
        a.props[x.url] = x.props
      }

      let i = a.urls.indexOf(x.url)
      a.relations.push([j, i])
    }

    return a
  }, {
    urls: [],
    crawled: [],
    props: {},
    relations: []
  })

crawler
  .subscribe({
    next: data => {

      fs.writeFileSync('public/data.json', JSON.stringify(data, null, ' '))

      // Add urls that haven't been crawled or already queued
      // to the queue
      let urls = data.urls
        .filter(x =>
          data.crawled.indexOf(x) === -1
          && data.props[x].inbound === true
        )

      emitter.emit('queue', urls)
    },
    complete: x => console.log('Finished', x),
    error: x => console.error('Error', x)
  })


// Get the first argument as the startUrl
process.argv.forEach(function (val, index, array) {
  if (index === 2) {
    startUrl = val
    emitter.emit('crawl', startUrl)
  }
})

