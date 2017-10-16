/**
 * Wrapper arount the property model, just delivers the data needed for the main game
 *
 * Reason for this module: simplify testing and access to properties
 * Created by kc on 24.04.15.
 */

const pm     = require('../../common/models/propertyModel');
const logger = require('../../common/lib/logger').getLogger('propertyWrapper');

module.exports = {
  /**
   * Get the property for a given location and game
   * @param gameId
   * @param propertyId
   */
  getProperty      : function (gameId, propertyId, callback) {
    pm.getPropertyById(gameId, propertyId, function (err, prop) {
      callback(err, prop);
    });
  },
  /**
   * Get the properties of a team
   * @param gameId
   * @param teamId
   * @param callback
   */
  getTeamProperties: function (gameId, teamId, callback) {
    pm.getPropertiesForTeam(gameId, teamId, function (err, properties) {
      if (err) {
        logger.error(err);
        return callback(err);
      }
      callback(null, properties);
    });
  },

  /**
   * Get all properties of a gameplay
   * @param gameId
   * @param callback
   */
  getAllProperties: function (gameId, callback) {
    pm.getPropertiesForGameplay(gameId, undefined, callback);
  },

  /**
   * Get all properties of a (pricelist-) group
   * @param gameId
   * @param groupId
   * @param callback
   */
  getPropertiesOfGroup: function (gameId, groupId, callback) {
    pm.getPropertiesForGameplay(gameId, {'propertyGroup': groupId}, function (err, properties) {
      return callback(err, properties);
    });
  },
  /**
   * Update the property
   * @param property
   */
  updateProperty      : function (property, callback) {
    pm.updateProperty(property.gameId, property, function (err) {
      callback(err);
    });
  },

  /**
   * Allow building for the properties again (all properties of this gameplay)
   * @param gameId
   * @param callback
   */
  allowBuilding: function (gameId, callback) {
    pm.allowBuilding(gameId, function (err, nbAffected) {
      callback(err, nbAffected);
    });
  },

  init: function () {
  }
};
