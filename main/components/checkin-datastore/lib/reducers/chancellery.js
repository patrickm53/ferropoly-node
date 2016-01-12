/**
 * The chancellery reducer
 * Created by kc on 12.01.16.
 */

var assign = require('lodash/object/assign');

module.exports = function(state, action) {
  state = state || {};

  switch(action.type) {
    case 'test':
      return assign({}, state, {test: action.test});

    default:
      return state;
  }
};
