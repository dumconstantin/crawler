'use strict'

const request = require('request-promise')
const most = require('most')
const cheerio = require('cheerio')

module.exports = function getUrlContent(x) {
  return most.fromPromise(request({
    url: x,
    transform: body => ({
      url: x,
      $: cheerio.load(body)
    })
  }))
}
