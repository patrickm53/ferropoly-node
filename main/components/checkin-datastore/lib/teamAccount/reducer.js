/**
 * Reducer for teamAccount
 * Created by kc on 15.01.16.
 */

const assign = require('lodash/assign');
const cst    = require('../constants');

function convertTransaction(t) {
  t.timestamp = new Date(t.timestamp);
  delete t.gameId;
  delete t.teamId;
  delete t._id;
  return t;
}

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
      // Set the transactions, convert the timestamp to dateTime
      let transactions = [];
      for (let i = 0; i < action.transactions.length; i++) {
        transactions.push(convertTransaction(action.transactions[i]));
      }
      return assign({}, state, {entryNb: action.transactions.length, transactions: transactions});

    case cst.ADD_TEAM_ACCOUNT_TRANSACTION:
      // Add new transaction
      state.transactions.push(convertTransaction(action.transaction));
      return assign({}, state, {asset: state.asset + action.transaction.transaction.amount});

    default:
      return state;
  }
};
