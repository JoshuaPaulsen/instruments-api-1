/*
client --> | --> instruments-api --> dal --> | --> couchdb
*/

require('dotenv').config()
const { merge } = require('ramda')
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
  replaceInstrument
}

module.exports = dal
