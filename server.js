const path = require('path')
const express = require('express')
const portfinder = require('portfinder')

const app = express()

const staticPath = path.join(__dirname, '/public')
app.use(express.static(staticPath))

app.get('/', (req, res) => {

})
portfinder.getPort((err, port) => {
  app.listen(port, function() {
    console.log(`Open http://localhost:${port} to view the cralwer`)
  })
})
