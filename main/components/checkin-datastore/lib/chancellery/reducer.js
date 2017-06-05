/**
 *
 * Created by kc on 12.01.16.
 */

const assign = require('lodash/assign');
const cst    = require('../constants');

module.exports = function (state, action) {
  state = state || {};

  switch (action.type) {
    case cst.SET_CHANCELLERY_ASSET:
      if (state.asset !== action.asset) {
        return assign({}, state, {asset: action.asset});
      }
      return state;

    case cst.RESET_CHANCELLERY:
      return {asset: 0};

    default:
      return state;
  }
};
