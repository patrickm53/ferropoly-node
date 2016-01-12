/**
 *
 * Created by kc on 12.01.16.
 */



module.exports = {
  setAsset: function (asset) {
    return {
      type: 'setAsset',
      asset : asset
    };
  }
};
