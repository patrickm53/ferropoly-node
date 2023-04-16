/**
 * This is a model for logging account activities
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 20.08.22
 **/

const mongoose = require('mongoose');
const logger   = require('../lib/logger').getLogger('accountModel');
const _        = require('lodash');

let accountLogSchema = mongoose.Schema({
  timestamp: Date,
  user     : String,
  activity : String
}, {autoIndex: true});

const accountLogEntry = mongoose.model('AccountLog', accountLogSchema);

/**
 * Adds an entry for a new user, "fire and forget", no callback
 * @param email
 * @param means type of login
 */
function addNewUserEntry(email, means) {
  addEntry({user: email, activity: `Neuer Zugang mit ${means} erstellt`}, err => {
    if (err) {
      logger.error(err);
    }
  })
    .then(() => {
    });
}

/**
 * Generic function for adding an entry
 * @param info
 * @param callback
 */
async function addEntry(info, callback) {
  let result;
  let err;
  try {
    let entry       = new accountLogEntry();
    entry.timestamp = new Date();
    entry.user      = _.get(info, 'user', 'none');
    entry.activity  = _.get(info, 'activity', '');
    result          = await entry.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, result);
  }
}

module.exports = {
  addEntry       : addEntry,
  addNewUserEntry: addNewUserEntry
}
