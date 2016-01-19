/**
 *
 * Created by kc on 12.01.16.
 */

var assign = require('lodash/object/assign');
var cst    = require('../constants');

module.exports = function (state, action) {
  state = state || {};

  switch (action.type) {
    case cst.SET_CHANCELLERY_ASSET:
      return assign({}, state, {asset: action.asset});

    case cst.RESET_CHANCELLERY:
      return {asset: 0};

    default:
      return state;
  }
};
