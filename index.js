'use strict'
const most = require('most')
const request = require('request')
const EventEmitter = require('events')
const emitter = new EventEmitter()
const jsdom = require('jsdom')
const Promise = require('bluebird')
const _ = require('lodash/fp')

const startUrl = 'https://google.com'

function stripUrls($, selector, prop) {
  let urls = $(selector)
    .toArray()
    .map(x => $(x).attr(prop))

  return urls
}

const stream = most
  .fromEvent('html', emitter)
  .chain(x => {
    return most.fromPromise(new Promise((resolve, reject) => {
      jsdom.env(x, ['http://code.jquery.com/jquery.js'], (err, window) => {
        if (err) {
          reject(err)
        } else {
          let $ = window.$
          let aHrefs = stripUrls($, 'a', 'href')
          let imgSrc = stripUrls($, 'img', 'src')

          let result = {
            aHrefs,
            imgSrc
          }

          resolve(result)
        }
      })
    }))
  })

stream
  .subscribe({
    next: x => console.log('Data', x),
    complete: x => console.log('Finished', x),
    error: x => console.error('Error', x)
  })

request(startUrl, (err, response, body) => {
  emitter.emit('html', body)
})