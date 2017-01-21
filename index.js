'use strict'
const most = require('most')
const request = require('request')
const EventEmitter = require('events')
const emitter = new EventEmitter()
const jsdom = require('jsdom')
const Promise = require('bluebird')
const _ = require('lodash/fp')

const startUrl = 'https://google.com'

const stream = most
  .fromEvent('html', emitter)
  .chain(x => {
    return most.fromPromise(new Promise((resolve, reject) => {
      jsdom.env(x, ['http://code.jquery.com/jquery.js'], (err, window) => {
        if (err) {
          reject(err)
        } else {
          let $ = window.$
          let links = $('a').toArray()

          let hrefs = _.reduce((acc, x) => {
            acc.push($(x).attr('href'))
            return acc
          }, [], links)

          resolve(hrefs)
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