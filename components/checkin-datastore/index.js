/**
 * This is the datastore MAIN for the checkin, based on redux and created with browserify
 *
 * See the grunt task in the main project for this
 *
 * Created by kc on 12.01.16.
 */

const dataStore  = require('./lib/store');

module.exports = {
  dataStore: dataStore()
};
