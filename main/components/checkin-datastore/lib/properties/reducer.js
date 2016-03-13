/**
 * Reducer for properties
 * Created by kc on 19.01.16.
 */

var assign = require('lodash/object/assign');
var cst    = require('../constants');
var remove = require('lodash/array/remove');

module.exports = function (state, action) {
  state = state || {properties: []};
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

    case cst.BUILDING_ALLOWED_AGAIN:
      // Building is allowed again
      var newProperties = state.properties || [];
      for (var i = 0; i < newProperties.length; i++) {
        if (newProperties[i].gamedata) {
          newProperties[i].gamedata.buildingEnabled = true;
        }
      }
      return assign({}, state, {properties: newProperties});

    default:
      return state;
  }
};
