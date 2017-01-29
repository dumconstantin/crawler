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
    error: x => console.error(x, x.stack)
  })

  queueing
    .subscribe({
      next: x => {
        console.log('Triggering queued', x)
        emitter.emit('crawl', x[0])
      },
      complete: x => console.log('Queue is empty'),
      error: x => console.error(x, x.stack)
    })


  console.log('Triggering ', url)
  // First url will be the root

  emitter.emit('crawl', url)

  return emitter
}

