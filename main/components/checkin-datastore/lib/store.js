/**
 *
 * Created by kc on 12.01.16.
 */

const redux    = require('redux');
const reducers = require('./reducers');
const uuid     = require('node-uuid').v4;
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
  let oldState = {};
  let self     = this;
  self.store.subscribe(function () {
    let newState = self.store.getState();
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
  socket.id = socket.id || uuid();

  let self = this;
  if (this.socket) {
    // Deregister Handler first
    this.socket.removeAllListeners('checkinStore');
  }
  this.socket = socket;
  console.log(`Datastore: socket with id ${socket.id} attached`);

  socket.on('checkinStore', function (data) {
    console.log('Message on "checkinStore" received, socketId: ' + socket.id, data);
    self.store.dispatch(data);
  })
};

/**
 * Returns the chancellery data
 * @returns {*}
 */
DataStore.prototype.getChancellery = function () {
  let state = this.store.getState();
  return state.chancellery;
};

/**
 * Returns the properties data
 * @returns {*}
 */
DataStore.prototype.getProperties = function () {
  let state = this.store.getState();
  return state.properties;
};

/**
 * Returns the teamAccount data
 * @returns {*}
 */
DataStore.prototype.getTeamAccount = function () {
  let state = this.store.getState();
  return state.teamAccount;
};

let store = new DataStore();

module.exports = function () {
  return store;
};
