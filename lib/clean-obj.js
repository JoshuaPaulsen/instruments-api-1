const { pick } = require('ramda')
module.exports = (arrApprovedKeys, obj) => pick(arrApprovedKeys, obj)
