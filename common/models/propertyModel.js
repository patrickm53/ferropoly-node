/**
 * A property is a location which is part of the game. In the editor app, a location becomes a property.
 *
 * In the game, only properties are used, no locations.
 * Created by kc on 10.02.15.
 */
'use strict';

var mongoose = require('mongoose');
var uuid = require('node-uuid');
/**
 * The mongoose schema for a property
 */
var propertySchema = mongoose.Schema({
  gameId: String, // Gameplay this property belongs to
  uuid: {type: String, index: true},     // UUID of this property (index)
  location: {
    name: String, // Name of the property
    uuid: String, // UUID of the location (referencing key)
    position: {lat: String, lng: String}, // position of the location
    accessibility: String // How do we access it?
  },
  gamedata: {
    owner: String, // Reference to the owner, undefined or empty is 'no owner'
    buildings: Number
  },
  pricelist: {
    priceRange: {type: Number, default: -1},
    positionInPriceRange: {type: Number, default: -1},
    position: {type: Number, default: -1},// Position inside complete price list
    propertyGroup: Number,
    price: Number,
    pricePerHouse: Number,
    rents: {
      noHouse: Number,
      oneHouse: Number,
      twoHouses: Number,
      threeHouses: Number,
      fourHouses: Number,
      hotel: Number
    }
  }

}, {autoIndex: false});

/**
 * The Property model
 */
var Property = mongoose.model('Property', propertySchema);

/**
 * Creates a new property from a location (if not already in DB) and stores it for the gameplay
 * @param gameId
 * @param location
 * @param callback
 */
var createPropertyFromLocation = function (gameId, location, callback) {
  var newProperty = new Property();
  newProperty.location = location;
  return updateProperty(gameId, newProperty, callback);
};

/**
 * Updates the given properties which must be properties objects
 * @param properties
 * @param callback
 */
var updateProperties = function (properties, callback) {
  for (var i = 0; i < properties.length; i++) {
    if (!(properties[i] instanceof Property)) {
      return callback(new Error('not real properties'));
    }
    var nb = 0;
    for (var i = 0; i < properties.length; i++) {
      properties[i].save(function (err) {
        if (err) {
          console.log('ERROR in updateProperties: ' + err.message);
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
var updateProperty = function (gameId, property, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  if (!property.location || !property.location.uuid) {
    // this one is pretty useless!
    return callback(new Error('No location added, can not save property'));
  }

  if (!(property instanceof Property)) {
    // This is not an instance of a property, create a new one
    var newProperty = new Property();
    newProperty.gamedata = property.gamedata;
    newProperty.pricelist = property.pricelist;
    newProperty.location = property.location;
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
        var prop = new Property();
        prop.gameId = gameId;
        prop.uuid = uuid.v4();
        prop.location = property.location;
        prop.gamedata = property.gamedata;
        prop.pricelist = property.pricelist;
        return prop.save(function (err, savedProp) {
          return callback(err, savedProp);
        })
      }
      else {
        // we found the property and do not touch gameId and location data
        foundProperty.gamedata = property.gamedata;
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
      console.log('Did not find location with uuid ' + propertyId);
      return callback(new Error('location not available'));
    }
    docs[0].pricelist.positionInPriceRange = position;
    docs[0].save(function (err, savedProperty) {
      console.log(savedProperty.location.name + ' updated');
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
 * Get all properties for a gameplay as REDUCED dataset (lean).
 * @param gameId
 * @param query , null if none
 * @param callback
 * @returns {Query}
 */
var getPropertiesForGameplay = function (gameId, query, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  if (query === null) {
    return Property.find({gameId: gameId}).lean().exec(function (err, docs) {
      if (err) {
        return callback(err);
      }
      return callback(null, docs);
    });
  }
  query.gameId = gameId;
  return Property.find(query, function (err, docs) {
    if (err) {
      return callback(err);
    }
    return callback(null, docs);
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
  console.log('Removing one property for ' + gameId);
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
var finalizeProperties = function (gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  Property.remove({gameId: gameId, 'pricelist.priceRange': -1}, function (err) {
      callback(err);
    }
  )
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
  console.log('Removing all properties for ' + gameId);
  Property.remove({gameId: gameId}, function (err) {
    callback(err);
  })
};

/**
 * The Exports
 * @type {{Model: (*|Model)}}
 */
module.exports = {
  Model: Property,
  removeAllPropertiesFromGameplay: removeAllPropertiesFromGameplay,
  removePropertyFromGameplay: removePropertyFromGameplay,
  getPropertiesForGameplay: getPropertiesForGameplay,
  getPropertyByLocationId: getPropertyByLocationId,
  updateProperty: updateProperty,
  createPropertyFromLocation: createPropertyFromLocation,
  updatePositionInPriceList: updatePositionInPriceList,
  updateProperties: updateProperties,
  finalizeProperties: finalizeProperties
};
