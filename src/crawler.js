'use strict'
const most = require('most')
const EventEmitter = require('events')
const crawl = require('./streams/crawl')
const queue = require('./streams/queue')


module.exports = function (url) {
  let emitter = new EventEmitter()
  let crawler = crawl(emitter)
  let queueing = queue(emitter)

  crawler
  .subscribe({
    next: data => {
      emitter.emit('data', data)
    },
    complete: x => console.log('Crawler finished', x),
    error: x => {
      console.error(x, x.stack)
      emitter.emit('error', x)
    }
  })

  queueing
    .subscribe({
      next: x => {
        console.log('Triggering queue', x)
        x.forEach(y => {
          emitter.emit('crawl', y)
        })
      },
      complete: x => console.log('Queue is empty'),
      error: x => {
        console.error(x, x.stack)
        emitter.emit('error', x)
      }
    })


  console.log('Triggering ', url)
  // First url will be the root

  emitter.emit('crawl', url)

  return emitter
}

