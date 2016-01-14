/**
 * This is the datastore MAIN for the checkin, based on redux and created with browserify
 * Created by kc on 12.01.16.
 */

var dataStore  = require('./lib/store');
var actions    = require('./lib/actions');

module.exports = {
  dataStore: dataStore(),
  actions  : actions
};
