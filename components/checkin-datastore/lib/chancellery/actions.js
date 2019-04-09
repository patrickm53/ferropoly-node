/**
 * Actions for Chancellery
 * Created by kc on 12.01.16.
 */

const cst = require('../constants');


module.exports = {
  setAsset: function (asset) {
    return {
      type : cst.SET_CHANCELLERY_ASSET,
      asset: asset
    };
  },

  reset: function () {
    return {
      type: cst.RESET_CHANCELLERY
    }
  }
};
