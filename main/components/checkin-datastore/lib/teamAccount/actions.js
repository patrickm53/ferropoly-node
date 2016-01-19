/**
 * Actions for TeamAccount
 * Created by kc on 15.01.16.
 */

var cst = require('../constants');


module.exports = {
  setAsset: function (asset, entryNb) {
    return {
      type : cst.SET_TEAM_ACCOUNT_ASSET,
      asset: asset,
      entryNb: entryNb
    };
  },

  reset: function () {
    return {
      type: cst.RESET_TEAM_ACCOUNT
    }
  },

  /**
   * Adds an entry to the store
   * @param entry is a teamAccountTransaction
   * @returns {{type: string, entry: *}}
   */
  addTransaction: function(entry) {
    return {
      type: cst.ADD_TEAM_ACCOUNT_TRANSACTION,
      transaction: entry
    }
  }
};
