/**
 *
 * Created by kc on 12.01.16.
 */

var assign = require('lodash/object/assign');

module.exports = function (state, action) {
  state = state || {};

  switch (action.type) {
    case 'setAsset':
      return assign({}, state, {asset: action.asset});

    case 'reset':
      return {asset: 0};

    default:
      return state;
  }
};
