'use strict'
const path = require('path')
const express = require('express')
const app = express()
const portfinder = require('portfinder')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const crawler = require('./src/crawler')

const staticPath = path.join(__dirname, '/public')
app.use(express.static(staticPath))

app.get('/', (req, res) => {
  res.sendfile('public/index.html')
})

io.on('connection', function(socket){

  socket.on('start-url', url => {
    let emitter = crawler(url)

    emitter.on('data', x => {
      socket.emit('data', x)
    })

  })

})

portfinder.getPort((err, port) => {
  http.listen(port, function() {
    console.log(`Open http://localhost:${port} to view the cralwer`)
  })
})
