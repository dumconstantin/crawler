const most = require('most')
const request = require('request')
const EventEmitter = require('events')
const emitter = new EventEmitter()

const startUrl = 'https://google.com'

const stream = most.fromEvent('data', emitter)

stream
  .observe(x => {
    console.log(x)
  })

request(startUrl, (err, response, body) => {
  emitter.emit('data', response)
})