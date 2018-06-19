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

const deleteInstrument = (instrument, callback) => {
  db.remove(instrument, callback)
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
  deleteInstrument
}

module.exports = dal
