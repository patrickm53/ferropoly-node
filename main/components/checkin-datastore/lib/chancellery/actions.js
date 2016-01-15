/**
 * Actions for Chancellery
 * Created by kc on 12.01.16.
 */

var cst = require('./constants');


module.exports = {
  setAsset: function (asset) {
    return {
      type : cst.ACTION_SET_ASSET,
      asset: asset
    };
  },

  reset: function () {
    return {
      type: cst.ACTION_RESET
    }
  }
};
