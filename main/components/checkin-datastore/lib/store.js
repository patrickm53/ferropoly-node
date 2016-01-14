/**
 *
 * Created by kc on 12.01.16.
 */

var redux    = require('redux');
var reducers = require('./reducers');

/**
 * Constructor of the DataStore
 * @constructor
 */
function DataStore() {
  this.store = redux.createStore(redux.combineReducers(reducers));
}

/**
 * Subscribe to a dataset (which has the same name as the reducer)
 * @param dataset
 * @param fnct
 */
DataStore.prototype.subscribe = function (dataset, fnct) {
  var oldState = {};
  var self = this;
  self.store.subscribe(function () {
    var newState = self.store.getState();
    if (newState[dataset] === oldState) {
      console.log('nothing changed for ' + dataset);
      return;
    }
    console.log('new state for ' + dataset);
    oldState = newState[dataset];
    fnct(oldState);
  });
};

/**
 * Dispatch an action
 * @param action
 * @param data
 */
DataStore.prototype.dispatch = function (action) {
  if (!action) {
    console.error('need an action');
    return;
  }
  console.log('Dispatch', action.type, action.data);
  this.store.dispatch(action)
};

/**
 * Attaches a socket.io socket to the store
 * @param socket
 */
DataStore.prototype.attachSocket = function (socket) {
  var self    = this;
  this.socket = socket;
  console.log('DataStore: socket attached');

  socket.on('checkinStore', function (data) {
    console.log('Message on "checkinStore" received', data);
    self.store.dispatch(data);
  })
};

/**
 * Returns the chancellery data
 * @returns {*}
 */
DataStore.prototype.getChancellery = function () {
  var state = this.store.getState();
  return state.chancellery;
};

var store = new DataStore();

module.exports = function () {
  return store;
};
