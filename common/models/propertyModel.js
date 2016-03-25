/**
 * A property is a location which is part of the game. In the editor app, a location becomes a property.
 *
 * In the game, only properties are used, no locations.
 * Created by kc on 10.02.15.
 */


var mongoose       = require('mongoose');
var uuid           = require('node-uuid');
var logger         = require('../lib/logger').getLogger('propertyModel');
var _              = require('lodash');
/**
 * The mongoose schema for a property
 */
var propertySchema = mongoose.Schema({
  _id      : String,
  gameId   : String, // Gameplay this property belongs to
  uuid     : {type: String, index: {unique: true}},     // UUID of this property (index)
  location : {
    name         : String, // Name of the property
    uuid         : String, // UUID of the location (referencing key)
    position     : {lat: String, lng: String}, // position of the location
    accessibility: String // How do we access it?
  },
  gamedata : {
    owner          : String, // Reference to the owner, undefined or empty is 'no owner'
    boughtTs       : Date,
    buildings      : Number,
    buildingEnabled: {type: Boolean, default: false}
  },
  pricelist: {
    priceRange          : {type: Number, default: -1},
    positionInPriceRange: {type: Number, default: -1},
    position            : {type: Number, default: -1},// Position inside complete price list
    propertyGroup       : Number,
    price               : Number,
    pricePerHouse       : Number,
    rents               : {
      noHouse    : Number,
      oneHouse   : Number,
      twoHouses  : Number,
      threeHouses: Number,
      fourHouses : Number,
      hotel      : Number
    }
  }

}, {autoIndex: true});

/**
 * The Property model
 */
var Property = mongoose.model('Property', propertySchema);

var createPropertyId = function (gameId, location) {
  return gameId + '-' + _.kebabCase(_.deburr(location.name)) + '-' + _.random(10000000, 99999999);
};

/**
 * Creates a new property from a location (if not already in DB) and stores it for the gameplay
 * @param gameId
 * @param location
 * @param callback
 */
var createPropertyFromLocation = function (gameId, location, callback) {
  var newProperty      = new Property();
  newProperty.location = location;
  newProperty._id      = createPropertyId(gameId, location);
  return updateProperty(gameId, newProperty, callback);
};

/**
 * Updates the given properties which must be properties objects
 * @param properties
 * @param callback
 */
var updateProperties          = function (properties, callback) {
  for (var i = 0; i < properties.length; i++) {
    if (!(properties[i] instanceof Property)) {
      return callback(new Error('not real properties'));
    }
    var nb = 0;
    for (var i = 0; i < properties.length; i++) {
      properties[i].save(function (err) {
        if (err) {
          logger.info('ERROR in updateProperties: ' + err.message);
        }
        nb++;
        if (nb === properties.length) {
          return callback();
        }
      })
    }
  }
};
/**
 * Updates a property, if not existing, creates a new one
 * @param gameId
 * @param property
 * @param callback
 */
var updateProperty            = function (gameId, property, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  if (!property.location || !property.location.uuid) {
    // this one is pretty useless!
    return callback(new Error('No location added, can not save property'));
  }

  if (!(property instanceof Property)) {
    // This is not an instance of a property, create a new one
    var newProperty       = new Property();
    newProperty.gamedata  = property.gamedata;
    newProperty.pricelist = property.pricelist;
    newProperty.location  = property.location;
    // recursive call
    return updateProperty(gameId, newProperty, function (err, prop) {
      return callback(err, prop);
    })
  }
  else {
    // This is a Property object, save it
    if (!property.gameId) {
      property.gameId = gameId;
    }
    if (!property.uuid) {
      property.uuid = uuid.v4();
    }
    // load the existing one (if there is one) and update it
    return getPropertyByLocationId(gameId, property.location.uuid, function (err, foundProperty) {
      if (err) {
        return callback(err);
      }
      if (!foundProperty) {
        // this is a new one!
        var prop       = new Property();
        prop.gameId    = gameId;
        prop.uuid      = uuid.v4();
        prop.location  = property.location;
        prop.gamedata  = property.gamedata;
        prop.pricelist = property.pricelist;
        prop._id       = createPropertyId(gameId, property.location);
        return prop.save(function (err, savedProp) {
          return callback(err, savedProp);
        })
      }
      else {
        // we found the property and do not touch gameId and location data
        foundProperty.gamedata  = property.gamedata;
        foundProperty.pricelist = property.pricelist;
        return foundProperty.save(function (err, savedProp) {
          return callback(err, savedProp);
        })
      }
    });
    return property.save(function (err, savedProp) {
      return callback(err, savedProp);
    });
  }
};
/**
 * Updates the position in the pricelist for a single position
 * @param gameId
 * @param propertyId
 * @param position
 * @param callback
 * @returns {*}
 */
var updatePositionInPriceList = function (gameId, propertyId, position, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  Property.find({gameId: gameId, uuid: propertyId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      logger.info('Did not find location with uuid ' + propertyId);
      return callback(new Error('location not available'));
    }
    docs[0].pricelist.positionInPriceRange = position;
    docs[0].save(function (err, savedProperty) {
      logger.info(savedProperty.location.name + ' updated');
      callback(err, savedProperty);
    });
  });
};

/**
 * Get a property by its location ID
 * @param gameId
 * @param locationId
 * @param callback
 * @returns {*}
 */
var getPropertyByLocationId = function (gameId, locationId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  Property.find({gameId: gameId, 'location.uuid': locationId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs[0]);
  });
};


/**
 * Get a property by its ID
 * @param gameId
 * @param propertyId ID of the property, NOT of the mongoDb entry (_id) !
 * @param callback
 * @returns {*}
 */
var getPropertyById          = function (gameId, propertyId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  Property.find({gameId: gameId, 'uuid': propertyId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs[0]);
  });
};
/**
 * Get all properties for a gameplay
 * Use the options to get:
 *   - a lean dataset (can't save a property then!
 *   - all properties of one propertyGroup (to check possession)
 *
 * @param gameId
 * @param options
 * @param callback
 * @returns {Query}
 */
var getPropertiesForGameplay = function (gameId, options, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }

  if (options && options.lean) {
    return Property.find()
      .where('gameId').equals(gameId)
      .lean()
      .exec(function (err, docs) {
        return callback(err, docs);
      });
  }
  else if (options && options.propertyGroup) {
    return Property.find()
      .where('gameId').equals(gameId)
      .where('pricelist.propertyGroup').equals(options.propertyGroup)
      .exec(function (err, docs) {
        return callback(err, docs);
      });
  }
  else {
    return Property.find()
      .where('gameId').equals(gameId)
      .exec(function (err, docs) {
        return callback(err, docs);
      });
  }
};
/**
 * Get the poperties for a team
 * @param gameId
 * @param teamId
 * @param callback
 * @returns {*}
 */
var getPropertiesForTeam     = function (gameId, teamId, callback) {
  if (!gameId || !teamId) {
    return callback(new Error('Parameter error'));
  }
  Property.find()
    .where('gamedata.owner').equals(teamId)
    .where('gameId').equals(gameId)
    .exec(function (err, data) {
      callback(err, data);
    });
};

/**
 * Get the propertyIds for a team. Reduces the amount of data transferred
 * @param gameId
 * @param teamId
 * @param callback
 * @returns {*}
 */
var getPropertiesIdsForTeam = function (gameId, teamId, callback) {
  if (!gameId || !teamId) {
    return callback(new Error('Parameter error'));
  }
  Property.find()
    .where('gamedata.owner').equals(teamId)
    .where('gameId').equals(gameId)
    .select('uuid')
    .exec(function (err, data) {
      callback(err, data);
    });
};

/**
 * Removes one property from the gameplay (deletes them in the DB)
 * @param gameId
 * @param locationId
 * @param callback
 */
var removePropertyFromGameplay = function (gameId, locationId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  logger.info('Removing one property for ' + gameId);
  Property.remove({gameId: gameId, 'location.uuid': locationId}, function (err) {
    callback(err);
  })
};

/**
 * Finalizes a game: removes all properties not assigned to the pricelist
 * @param gameId
 * @param callback
 * @returns {*}
 */
var finalizeProperties              = function (gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }

  Property.find()
    .where('pricelist.priceRange').equals(-1)
    .where('gameId').equals(gameId)
    .remove(callback);
};
/**
 * Removes ALL properties from the gameplay
 * @param gameId
 * @param callback
 */
var removeAllPropertiesFromGameplay = function (gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  logger.info('Removing all properties for ' + gameId);
  Property.find({gameId: gameId}).remove(callback);
};

/**
 * Allows building for all properties in the gameplay
 * @param gameId
 * @param callback
 * @returns {*}
 */
var allowBuilding = function (gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  Property.update({
    gameId          : gameId,
    'gamedata.owner': {'$exists': true, '$ne': ''}
  }, {'gamedata.buildingEnabled': true}, {multi: true}, function (err, numAffected) {
    callback(err, numAffected);
  });
};

/**
 * The Exports
 * @type {{Model: (*|Model)}}
 */
module.exports = {
  Model                          : Property,
  removeAllPropertiesFromGameplay: removeAllPropertiesFromGameplay,
  removePropertyFromGameplay     : removePropertyFromGameplay,
  getPropertiesForGameplay       : getPropertiesForGameplay,
  getPropertiesForTeam           : getPropertiesForTeam,
  getPropertyByLocationId        : getPropertyByLocationId,
  getPropertyById                : getPropertyById,
  updateProperty                 : updateProperty,
  createPropertyFromLocation     : createPropertyFromLocation,
  updatePositionInPriceList      : updatePositionInPriceList,
  updateProperties               : updateProperties,
  finalizeProperties             : finalizeProperties,
  allowBuilding                  : allowBuilding,
  getPropertiesIdsForTeam        : getPropertiesIdsForTeam
};
