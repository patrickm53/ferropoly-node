/**
 * Wrapper arount the property model, just delivers the data needed for the main game
 *
 * Reason for this module: simplify testing and access to properties
 * Created by kc on 24.04.15.
 */
'use strict';
var pm = require('../../common/models/propertyModel');

module.exports = {
  /**
   * Get the property for a given location and game
   * @param gameId
   * @param locationId
   */
  getProperty: function (gameId, locationId) {
    pm.getPropertyByLocationId(gameId,  locationId, function(err, prop) {
      callback(err, prop);
    });
  },
  /**
   * Update the property
   * @param property
   */
  updateProperty: function(property) {
    pm.updateProperty(property.gameId, property, function(err) {
      callback(err);
    })
  }
};
