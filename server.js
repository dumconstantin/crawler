'use strict'
const path = require('path')
const express = require('express')
const app = express()
const portfinder = require('portfinder')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const crawler = require('./src/crawler')

const port = process.env.WEB_PORT

const staticPath = path.join(__dirname, '/public')
app.use(express.static(staticPath))

app.get('/', (req, res) => {
  res.sendfile('public/index.html')
})

io.on('connection', function(socket){
  let events = ['data', 'error']

  socket.on('start-url', url => {
    let emitter = crawler(url)

    events.forEach(x => {
      emitter.on(x, y => socket.emit(x, y))
    })

  })

})

http.listen(port, function() {
  console.log(`Open http://localhost:${port} to view the cralwer`)
})
