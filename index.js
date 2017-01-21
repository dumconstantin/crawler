'use strict'
const most = require('most')
const request = require('request')
const EventEmitter = require('events')
const emitter = new EventEmitter()
const jsdom = require('jsdom')
const Promise = require('bluebird')

const startUrl = 'https://google.com'

const stream = most
  .fromEvent('html', emitter)
  .chain(x => {
    return most.fromPromise(new Promise((resolve, reject) => {
      jsdom.env('<p>asd</p>', ['http://code.jquery.com/jquery.js'], (err, window) => {
        if (err) {
          reject(err)
        } else {
          let links = window.document.querySelector('a').innerText
          resolve(links)
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