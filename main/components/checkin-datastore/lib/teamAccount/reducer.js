/**
 * Reducer for teamAccount
 * Created by kc on 15.01.16.
 */

var assign = require('lodash/object/assign');
var cst    = require('./constants');

module.exports = function (state, action) {
  state = state || {transactions: [], asset: 0};
  console.log(state, action);
  switch (action.type) {
    case cst.ACTION_SET_ASSET:
      return assign({}, state, {asset: action.asset, entryNb: action.entryNb});

    case cst.ACTION_RESET:
      return {transactions: [], asset: 0};

    case cst.ACTION_ADD_TRANSACTION:
      state.transactions.push(action.transaction);
      return assign({}, state);

    default:
      return state;
  }
};
