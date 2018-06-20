/*
client --> | --> instruments-api --> dal --> | --> couchdb
*/

require('dotenv').config()
const { merge, map } = require('ramda')
const PouchDB = require('pouchdb-core')
const pkGen = require('./lib/pk-gen')

PouchDB.plugin(require('pouchdb-adapter-http'))

const db = new PouchDB(
  `${process.env.COUCH_HOSTNAME}${process.env.COUCH_DBNAME}`
)

const getInstrument = (id, callback) => db.get(id, callback)

const addInstrument = (instrument, callback) => {
  const modifiedInstrument = merge(instrument, {
    type: 'instrument',
    _id: pkGen('instrument', '_', `${instrument.category} ${instrument.name}`)
  })
  db.put(modifiedInstrument, callback)
}

const deleteInstrument = (instrumentID, callback) => {
  db.get(instrumentID, function(err, instrument) {
    if (err) {
      callback(err)
      return
    }
    db.remove(instrument, function(err, deleteResult) {
      if (err) {
        callback(err)
        return
      }
      callback(null, deleteResult)
    })
  })
}

const replaceInstrument = (instrument, callback) => {
  db.get(instrument._id, function(err, oldInstrument) {
    if (err) {
      callback(err)
      return
    }
    db.put(instrument, function(err, replaceResult) {
      if (err) {
        callback(err)
        return
      }
      callback(null, replaceResult)
    })
  })
}
/*
{
"total_rows": 6,
"offset": 0,
"rows": [
{
"id": "dog-german-shepherd-delta",
"key": "dog-german-shepherd-delta",
"value": {
"rev": "3-8f6ec7e3616f37825ce14f73916af461"
},
"doc": {
  "_id": "dog-german-shepherd-delta",
  "_rev": "3-8f6ec7e3616f37825ce14f73916af461",
  "name": "Delta",
  "breed": "german shepherd",
  "owner": "Reyne Moore",
  "age": 1
  }
},
*/
function getDoc(row) {
  return row.doc
}

const listInstruments = (limitStr, cb) => {
  db.allDocs({ include_docs: true, limit: Number(limitStr) }, function(
    err,
    instruments
  ) {
    if (err) {
      cb(err)
      return
    }
    cb(null, map(row => row.doc, instruments.rows))
  })
}

///////////////////////////
////  HELPER FUNCTIONS ////
///////////////////////////
/*
function getDoc(id, callback) {
  db.get(id, callback)
}
*/

const dal = {
  getInstrument,
  addInstrument,
  deleteInstrument,
  replaceInstrument,
  listInstruments
}

module.exports = dal
