/*
client --> | --> instruments-api --> dal --> | --> couchdb
*/

require('dotenv').config()
const { merge, map } = require('ramda')
const PouchDB = require('pouchdb-core')
const pkGen = require('./lib/pk-gen')
const { prop, propOr } = require('ramda')

PouchDB.plugin(require('pouchdb-adapter-http'))

const db = new PouchDB(
  `${process.env.COUCH_HOSTNAME}${process.env.COUCH_DBNAME}`
)

const getInstrument = id => db.get(id)

const addInstrument = instrument => {
  const modifiedInstrument = merge(instrument, {
    type: 'instrument',
    _id: pkGen('instrument', '_', `${instrument.category} ${instrument.name}`)
  })
  return db.put(modifiedInstrument)
}

const deleteInstrument = instrumentID =>
  db.get(instrumentID).then(instrument => db.remove(instrument))

const replaceInstrument = instrument =>
  db.get(instrument._id).then(newInstrument => db.put(newInstrument))
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

const listInstruments = limitStr =>
  db
    .allDocs({ include_docs: true, limit: Number(limitStr) })
    .then(instruments => map(prop('doc'), propOr([], 'rows', instruments)))

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
