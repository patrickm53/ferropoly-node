/**
 * A property is a location which is part of the game. In the editor app, a location becomes a property.
 *
 * In the game, only properties are used, no locations.
 * Created by kc on 10.02.15.
 */


const mongoose       = require('mongoose');
const logger         = require('../lib/logger').getLogger('propertyModel');
const _              = require('lodash');
const {v4: uuid}     = require('uuid');
/**
 * The mongoose schema for a property
 */
const propertySchema = mongoose.Schema({
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
const Property = mongoose.model('Property', propertySchema);

const createPropertyId = function (gameId, location) {
  return gameId + '-' + _.kebabCase(_.deburr(location.name)) + '-' + _.random(10000000, 99999999);
};

/**
 * Creates a new property from a location (if not already in DB) and stores it for the gameplay
 * @param gameId
 * @param location
 * @param callback
 */
function createPropertyFromLocation(gameId, location, callback) {
  let newProperty      = new Property();
  newProperty.location = location;
  newProperty._id      = createPropertyId(gameId, location);
  return updateProperty(gameId, newProperty, callback);
}

/**
 * Updates the given properties which must be properties objects
 * @param properties
 * @param callback
 */
async function updateProperties(properties, callback) {

  for (let i = 0; i < properties.length; i++) {
    if (!(properties[i] instanceof Property)) {
      return callback(new Error('not real properties'));
    }
  }

  let err;
  try {
    for (const p of properties) {
      await p.save();
    }
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err);
  }
}

/**
 * Updates a property only using some data supplied. Internal usage only
 * @param gameId
 * @param property
 * @param callback
 */
function updatePropertyPartial(gameId, property, callback) {

  getPropertyById(gameId, property.uuid, async (err, loadedProperty) => {
    if (err) {
      return callback(err);
    }
    _.merge(loadedProperty, property);

    let res, errInfo;
    try {
      res = await loadedProperty.save();
    } catch (ex) {
      logger.error(ex);
      errInfo = ex;
    } finally {
      callback(errInfo, res);
    }
  });

}

/**
 * Updates a property, if not existing, creates a new one
 * @param gameId
 * @param property
 * @param callback
 */
async function updateProperty(gameId, property, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  if (!property.location || !property.location.uuid) {
    // this one is pretty useless!
    return callback(new Error('No location added, can not save property'));
  }
  if (!(property instanceof Property)) {
    /* In the original version, we created here a new property object.
       This could have been important for the admin, but this was not
       the best solution
    */
    updatePropertyPartial(gameId, property, (err, prop) => {
      return callback(err, prop);
    });
  } else {
    // This is a Property object, save it
    if (!property.gameId) {
      property.gameId = gameId;
    }
    if (!property.uuid) {
      property.uuid = uuid();
    }
    // load the existing one (if there is one) and update it
    return getPropertyByLocationId(gameId, property.location.uuid, async function (err, foundProperty) {
      if (err) {
        return callback(err);
      }
      if (!foundProperty) {
        // this is a new one!
        let prop       = new Property();
        prop.gameId    = gameId;
        prop.uuid      = uuid();
        prop.location  = property.location;
        prop.gamedata  = property.gamedata;
        prop.pricelist = property.pricelist;
        prop._id       = createPropertyId(gameId, property.location);

        let savedProp, errInfo;
        try {
          savedProp = await prop.save();
        } catch (ex) {
          logger.error(ex);
          errInfo = ex;
        } finally {
          callback(errInfo, savedProp)
        }
      } else {
        // we found the property and do not touch gameId and location data
        foundProperty.gamedata  = property.gamedata;
        foundProperty.pricelist = property.pricelist;

        let savedProp, errInfo;
        try {
          savedProp = await foundProperty.save();
        } catch (ex) {
          logger.error(ex);
          errInfo = ex;
        } finally {
          callback(errInfo, savedProp)
        }
      }
    });
  }
}

/**
 * Updates the position in the pricelist for a single position
 * @param gameId
 * @param propertyId
 * @param position
 * @param callback
 * @returns {*}
 */
async function updatePositionInPriceList(gameId, propertyId, position, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  let savedProperty, err;
  try {
    const docs = await Property
      .findOne({gameId: gameId, uuid: propertyId})
      .exec();
    if (!docs) {
      logger.info(`${gameId}: Did not find location with uuid ${propertyId}`);
      return callback(new Error('location not available'));
    }
    docs.pricelist.positionInPriceRange = position;

    savedProperty = await docs.save();
    logger.info(`${gameId}: ${savedProperty.location.name} updated v: ${savedProperty.pricelist.positionInPriceRange}`);
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, savedProperty);
  }
}

/**
 * Get a property by its location ID
 * @param gameId
 * @param locationId
 * @param callback
 * @returns {*}
 */
async function getPropertyByLocationId(gameId, locationId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }

  let docs, err;
  try {
    docs = await Property
      .findOne({gameId: gameId, 'location.uuid': locationId})
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, docs);
  }
}


/**
 * Get a property by its ID
 * @param gameId
 * @param propertyId ID of the property, NOT of the mongoDb entry (_id) !
 * @param callback
 * @returns {*}
 */
async function getPropertyById(gameId, propertyId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  let err, docs;
  try {
    docs = await Property
      .findOne({gameId: gameId, 'uuid': propertyId})
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, docs);
  }
}

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
async function getPropertiesForGameplay(gameId, options, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }

  let docs, err;
  try {
    if (options && options.lean) {
      docs = await Property
        .find()
        .where('gameId').equals(gameId)
        .lean()
        .exec();
    } else if (options && options.propertyGroup) {
      docs = await Property
        .find()
        .where('gameId').equals(gameId)
        .where('pricelist.propertyGroup').equals(options.propertyGroup)
        .exec();
    } else {
      docs = await Property
        .find()
        .where('gameId').equals(gameId)
        .exec();
    }
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, docs);
  }
}

/**
 * Get the poperties for a team
 * @param gameId
 * @param teamId
 * @param callback
 * @returns {*}
 */
async function getPropertiesForTeam(gameId, teamId, callback) {
  if (!gameId || !teamId) {
    return callback(new Error('Parameter error'));
  }

  let data, err;
  try {
    data = await Property
      .find()
      .where('gamedata.owner').equals(teamId)
      .where('gameId').equals(gameId)
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, data);
  }
}

/**
 * Get the propertyIds for a team. Reduces the amount of data transferred
 * @param gameId
 * @param teamId
 * @param callback
 * @returns {*}
 */
async function getPropertiesIdsForTeam(gameId, teamId, callback) {
  if (!gameId || !teamId) {
    return callback(new Error('Parameter error'));
  }
  let err, data;
  try {
    data = await Property
      .find()
      .where('gamedata.owner').equals(teamId)
      .where('gameId').equals(gameId)
      .select('uuid')
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, data);
  }
}

/**
 * Removes one property from the gameplay (deletes them in the DB)
 * @param gameId
 * @param locationId
 * @param callback
 */
async function removePropertyFromGameplay(gameId, locationId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }

  let res, err;
  try {
    logger.info(`${gameId}: Removing one property`, {locationId, gameId});
    res = await Property
      .deleteOne({gameId: gameId, 'location.uuid': locationId})
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * Finalizes a game: removes all properties not assigned to the pricelist
 * @param gameId
 * @param callback
 * @returns {*}
 */
async function finalizeProperties(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }

  let err, res;
  try {
    res = await Property
      .deleteMany({
        gameId                : gameId,
        'pricelist.priceRange': -1
      })
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * Removes ALL properties from the gameplay
 * @param gameId
 * @param callback
 */
async function removeAllPropertiesFromGameplay(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  logger.info(`${gameId}: Removing all properties`);

  let err, res;
  try {
    res = await Property
      .deleteMany({gameId: gameId})
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * Allows building for all properties in the gameplay
 * @param gameId
 * @param callback
 * @returns {*}
 */
async function allowBuilding(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }

  let res, err;
  try {
    const numAffected = await Property
      .updateMany(
        {
          gameId          : gameId,
          'gamedata.owner': {
            '$exists': true,   // must exist
            '$ne'    : ''      // not equal empty
          }
        },
        {
          'gamedata.buildingEnabled': true
        })
      .exec();

    res = _.get(numAffected, 'nModified', 0);
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

/**
 * Count the properties of a given game
 * @param gameId
 * @param callback
 * @returns {*}
 */
async function countProperties(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }

  let err, res;
  try {
    res = await Property
      .countDocuments({gameId: gameId})
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

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
  getPropertiesIdsForTeam        : getPropertiesIdsForTeam,
  countProperties                : countProperties
};
