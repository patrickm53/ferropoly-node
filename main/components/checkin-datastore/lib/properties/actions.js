/**
 * Actions for properties
 * Created by kc on 19.01.16.
 */

var cst = require('../constants');


module.exports = {
  /**
   * Set all properties (overwrite all)
   * @param properties
   * @returns {{type: (string|string), asset: *, entryNb: *}}
   */
  setProperties: function (properties) {
    return {
      type   : cst.SET_PROPERTIES,
      properties  : properties
    };
  },

  /**
   * Updates one single property (adds it, if not in list)
   * @param property
   * @returns {{type: string, property: *}}
   */
  updateProperty: function(property) {
    return {
      type   : cst.UPDATE_PROPERTY,
      property  : property
    };
  },

  /**
   * Building is allowed again for all properties (paying rent)
   * @returns {{type: string}}
   */
  buildingAllowedAgain: function() {
    return {
      type: cst.BUILDING_ALLOWED_AGAIN
    }
  }

};
