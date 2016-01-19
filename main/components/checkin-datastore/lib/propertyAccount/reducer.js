/**
 * Reducer for property Account
 * Created by kc on 19.01.16.
 */

var assign = require('lodash/object/assign');
var cst    = require('../constants');
var remove = require('lodash/array/remove');

module.exports = function (state, action) {
  state = state || {transactions: [], asset: 0};
  console.log(state, action);
  switch (action.type) {
    case cst.SET_PROPERTIES:
      // set all properties
      return assign({}, state, {properties: action.properties});

    case cst.UPDATE_PROPERTY:
      // Update or add a property
      var newProperties = state.properties || [];
      remove(newProperties, {uuid: action.property.uuid});
      newProperties.push(action.property);
      return assign({}, state, {properties: newProperties});

    default:
      return state;
  }
};
