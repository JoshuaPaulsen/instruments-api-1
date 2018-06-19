const { curry, difference, keys } = require('ramda')

module.exports = curry((arrProps, obj) => difference(arrProps, keys(obj)))
