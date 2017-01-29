'use strict'

const most = require('most')

const getUrlContent = require('./../fn/getUrlContent')
const parseContent = require('./../fn/parseContent')
const parseUrls = require('./../fn/parseUrls')

let types = {
  a: 'href',
  img: 'src',
  script: 'src',
  link: 'href'
}

module.exports = emitter =>
  most
    .fromEvent('crawl', emitter)
    .chain(getUrlContent)
    .map(parseContent(types))
    .scan((a, b) => {

      let j
      if (a.urls.length === 0) {
        a.urls.push(b.parent)
        a.crawled.push(b.parent)
        j = 0
      } else {
        j = a.urls.indexOf(b.parent)
        a.crawled.push(b.parent)
      }

      while (b.urls.length > 0) {
        let x = b.urls.shift()

        if (a.urls.indexOf(x) === -1) {
          a.urls.push(x)
        } else {

        }

        let i = a.urls.indexOf(x)
        a.relations.push([j, i])
      }

      return a
    }, {
      urls: [],
      crawled: [],
      relations: []
    })
    .map(x => {
      x.props = parseUrls(x.urls)
      return x
    })
    .tap(data => {

      // Send urls to queue that haven't been crawled or already queued
      // to the queue
      let urls = data.urls
        .filter(x =>
          data.crawled.indexOf(x) === -1
          && data.props[x].inbound === true
        )

      emitter.emit('queue', urls)
    })
