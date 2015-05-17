/**
 * Wrapper arount the property model, just delivers the data needed for the main game
 *
 * Reason for this module: simplify testing and access to properties
 * Created by kc on 24.04.15.
 */
'use strict';
var pm = require('../../common/models/propertyModel');
var ferroSocket;

/**
 * Handles the commands received over the ferroSocket
 * @param req
 */
var socketCommandHandler = function (req) {
  console.log('properties socket handler: ' + req.cmd.name);
  switch (req.cmd.name) {
    case 'getProperties':
      pm.getPropertiesForGameplay(req.gameId, {lean: true}, function (err, props) {
        var resp = {
          err: err, cmd: {
            name: 'getProperties', data: props
          }
        };
        req.response('properties', resp);
      });
  }
};

module.exports = {
  /**
   * Get the property for a given location and game
   * @param gameId
   * @param propertyId
   */
  getProperty: function (gameId, propertyId, callback) {
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
        console.error(err);
        return callback(err);
      }
      callback(null, properties);
    });
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
  updateProperty: function (property, callback) {
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
    ferroSocket = require('./ferroSocket').get();
    ferroSocket.on('properties', socketCommandHandler);
  }
};
