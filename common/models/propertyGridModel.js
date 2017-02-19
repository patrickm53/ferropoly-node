/**
 * The model for a property grid connecting different properties
 *
 *  ToDo: Idea: how about to assign the properties in the grid to squares and evaluate the values
 *  for them too?
 *
 * Created by christian on 13.12.16.
 */

const mongoose = require('mongoose');
const uuid     = require('node-uuid');
const logger   = require('../lib/logger').getLogger('propertyGridModel');
const _        = require('lodash');

/**
 * The mongoose schema for a property
 */
const propertyGridSchema = mongoose.Schema({
  _id               : String,
  gameId            : String, // Gameplay this item belongs to
  propertyId        : String, // Assigned property
  neighbours        : {type: Array},
  isNeighbourOf     : {type: Array},
  availabilityChance: {type: Number, default: 100}

}, {autoIndex: true});

/**
 * The PropertyGrid model
 */
const PropertyGrid = mongoose.model('PropertyGrid', propertyGridSchema);


/**
 * Creates a property grid element out of a property
 * @param property
 * @param: callaback
 */
const create = function (property, callback) {
  let propertyGridElement           = new PropertyGrid();
  propertyGridElement._id           = property._id;
  propertyGridElement.propertyId    = property.uuid;
  propertyGridElement.gameId        = property.gameId;
  propertyGridElement.neighbours    = [];
  propertyGridElement.isNeighbourOf = [];

  propertyGridElement.save((err, savedElement) => {
    callback(err, savedElement);
  });
};

/**
 * Removes ALL properties from the gameplay
 * @param gameId
 * @param callback
 */
const removeAllPropertyGridsFromGameplay = function (gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  logger.info('Removing all propertyGrids for ' + gameId);
  PropertyGrid.find({gameId: gameId}).remove(callback);
};

/**
 * Get a specific propertygrid
 * @param gameId
 * @param propertyId
 * @param callback
 * @returns {*}
 */
const get = function (gameId, propertyId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  PropertyGrid.find({gameId: gameId, propertyId: propertyId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    return callback(null, docs[0]);
  });
};


/**
 * Get the complete grid for a gameplay
 * @param gameId
 * @param callback
 */
const getAllForGameplay = function (gameId, callback) {
  PropertyGrid.find({gameId: gameId}, function (err, docs) {
    return callback(err, docs);
  });
};

/**
 * A wrapper for saving a property grid
 * @param propertyGrid
 * @param callback
 */
const saveSingle = function (propertyGrid, callback) {
  propertyGrid.save((err, savedElement) => {
    if (err) {
      logger.error(err);
    }
    return callback(err);
  });
};


module.exports = {
  Model                             : propertyGridSchema,
  create                            : create,
  get                               : get,
  getAllForGameplay                 : getAllForGameplay,
  saveSingle                        : saveSingle,
  removeAllPropertyGridsFromGameplay: removeAllPropertyGridsFromGameplay
};