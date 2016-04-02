/**
 * Reducer for teamAccount
 * Created by kc on 15.01.16.
 */

var assign = require('lodash/assign');
var cst    = require('../constants');

module.exports = function (state, action) {
  state = state || {transactions: [], asset: 0};
  console.log(state, action);
  switch (action.type) {
    case cst.SET_TEAM_ACCOUNT_ASSET:
      // Set fix value
      return assign({}, state, {asset: action.asset, entryNb: action.entryNb});

    case cst.RESET_TEAM_ACCOUNT:
      // Reset value
      return {transactions: [], asset: 0};

    case cst.SET_TEAM_ACCOUNT_TRANSACTIONS:
      // Set the transactions
      return assign({}, state, {entryNb: action.transactions.length, transactions: action.transactions});

    case cst.ADD_TEAM_ACCOUNT_TRANSACTION:
      // Add new transaction
      state.transactions.push(action.transaction);
      return assign({}, state, {asset: state.asset + action.transaction.transaction.amount});

    default:
      return state;
  }
};
