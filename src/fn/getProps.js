'use strict'

module.exports = function getProps($, selector, prop) {
  return $(selector)
    .toArray()
    .map(x => $(x).attr(prop))
}
