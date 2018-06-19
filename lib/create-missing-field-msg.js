const { compose, concat, join } = require('ramda')
const checkRequiredFields = require('./check-required-fields')

module.exports = missingKeys =>
  compose(
    concat("You're missing the following fields in your request body: "),
    join(', ')
  )(missingKeys)
