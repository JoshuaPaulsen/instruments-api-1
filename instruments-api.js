require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const bodyParser = require('body-parser')
const {
  getInstrument,
  addInstrument,
  deleteInstrument,
  replaceInstrument,
  listInstruments
} = require('./dal')
const NodeHTTPError = require('node-http-error')
const { propOr, isEmpty, not, pluck, pathOr } = require('ramda')
const checkRequiredFields = require('./lib/check-required-fields')
const createMissingFieldMsg = require('./lib/create-missing-field-msg')
const cleanObj = require('./lib/clean-obj')

app.use(bodyParser.json())

app.get('/', function(req, res, next) {
  res.send('Welcome to the Instruments api.')
})

app.get('/instruments', function(req, res, next) {
  const limit = pathOr(100, ['query', 'limit'], req)

  listInstruments(limit)
    .then(list => res.status(200).send(list))
    .catch(err => next(new NodeHTTPError(err.status, err.message, err)))
})

app.get('/instruments/:instrumentID', function(req, res, next) {
  const instrumentID = req.params.instrumentID
  getInstrument(instrumentID)
    .then(instrument => res.status(200).send(instrument))
    .catch(err => next(new NodeHTTPError(err.status, err.message, err)))
})

app.delete('/instruments/:instrumentID', function(req, res, next) {
  const instrumentID = req.params.instrumentID
  // Check item in the database
  deleteInstrument(instrumentID)
    .then(deleteResult => res.status(200).send(deleteResult))
    .catch(err => next(new NodeHTTPError(err.status, err.message, err)))
})

app.post('/instruments', function(req, res, next) {
  const newInstrument = propOr({}, 'body', req)

  if (isEmpty(newInstrument)) {
    next(new NodeHTTPError(400, 'missing instrument in body.'))
    return
  }

  // TODO: Check required
  const requiredFields = [
    'name',
    'category',
    'group',
    'retailPrice',
    'manufacturer'
  ]

  if (not(isEmpty(checkRequiredFields(requiredFields, newInstrument)))) {
    next(
      new NodeHTTPError(
        400,
        createMissingFieldMsg(
          checkRequiredFields(requiredFields, newInstrument)
        )
      )
    )
    return
  }

  const cleanedInstrument = cleanObj(requiredFields, newInstrument)

  addInstrument(cleanedInstrument)
    .then(instrument => res.status(200).send(instrument))
    .catch(err => next(new NodeHTTPError(err.status, err.message, err)))
})

app.put('/instruments/:instrumentID', function(req, res, next) {
  const newInstrument = propOr({}, 'body', req)

  if (isEmpty(newInstrument)) {
    next(new NodeHTTPError(400, 'missing instrument in body.'))
    return
  }

  // TODO: Check required
  const requiredFields = [
    'name',
    'category',
    'group',
    'retailPrice',
    'manufacturer',
    '_id',
    '_rev'
  ]
  if (not(isEmpty(checkRequiredFields(requiredFields, newInstrument)))) {
    next(
      new NodeHTTPError(
        400,
        createMissingFieldMsg(
          checkRequiredFields(requiredFields, newInstrument)
        )
      )
    )
  }
  const cleanedInstrument = cleanObj(requiredFields, newInstrument)

  replaceInstrument(cleanedInstrument)
    .then(replacedInstrument => res.status(200).send(replacedInstrument))
    .catch(err => new NodeHTTPError(err.status, err.message, err))
})

app.use(function(err, req, res, next) {
  console.log(
    'ERROR! ',
    'METHOD: ',
    req.method,
    ' PATH',
    req.path,
    ' error:',
    JSON.stringify(err)
  )
  res.status(err.status || 500)
  res.send(err)
})

app.listen(port, () => console.log('API is up', port))
