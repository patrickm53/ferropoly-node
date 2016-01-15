/**
 * Actions for TeamAccount
 * Created by kc on 15.01.16.
 */

var cst = require('./constants');


module.exports = {
  setAsset: function (asset, entryNb) {
    return {
      type : cst.ACTION_SET_ASSET,
      asset: asset,
      entryNb: entryNb
    };
  },

  reset: function () {
    return {
      type: cst.ACTION_RESET
    }
  },

  /**
   * Adds an entry to the store
   * @param entry is a teamAccountTransaction
   * @returns {{type: string, entry: *}}
   */
  addTransaction: function(entry) {
    return {
      type: cst.ACTION_ADD_TRANSACTION,
      transaction: entry
    }
  }
};
