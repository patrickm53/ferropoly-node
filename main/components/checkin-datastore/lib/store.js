/**
 *
 * Created by kc on 12.01.16.
 */

var redux    = require('redux');
var reducers = require('./reducers');

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
  store.subscribe(function () {
    var newState = store.getState();
    if (newState[dataset] === oldState) {
      console.log('nothing changed for ' + dataset);
      return;
    }
    console.log('new state for ' + dataset);
    oldState = newState[dataset];
    fnct(newState);
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

DataStore.prototype.getChancellery = function() {
  var state = this.store.getState();
  return state.chancellery;
};

var store = new DataStore();

module.exports = function () {
  return store;
};
