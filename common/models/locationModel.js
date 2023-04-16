/**
 * This is the model of a location. A location can be used for games and belongs to different
 * kinds of maps. If it is used in a game, it becomes a property (in the game itself, only
 * properties are used. Locations are created in the admin-app and transformed to properties
 * in the editor app).
 *
 * Created by kc on 02.01.15.
 */

const mongoose = require('mongoose');
const logger   = require('../lib/logger').getLogger('locationModel');
const mapinfo  = require('../lib/maps.json');
const _        = require('lodash');

/**
 * The mongoose schema for a location
 */
const locationSchema = mongoose.Schema({
  name         : String,                       // Name of the location
  uuid         : {type: String, index: true},  // UUID of the location, this is the key we are referencing to
  position     : {lat: String, lng: String},   // position of the location
  accessibility: String,                       // How do we access it?
  maps         : {
    zvv      : {type: Boolean, default: false},
    zvv110   : {type: Boolean, default: false},
    sbb      : {type: Boolean, default: false},
    ostwind  : {type: Boolean, default: false},
    libero   : {type: Boolean, default: false},
    libero100: {type: Boolean, default: false},
    tva      : {type: Boolean, default: false},
    tvlu     : {type: Boolean, default: false},
    tnw      : {type: Boolean, default: false}
  }
}, {autoIndex: true});

/**
 * The Location model
 */
const Location = mongoose.model('Location', locationSchema);

/**
 * Returns all locations in ferropoly style, LEAN
 * @param callback
 */
async function getAllLocationsLean(callback) {
  let err, locations;
  try {
    const docs = await Location
      .find({})
      .lean()
      .exec()

    locations = [];
    for (let i = 0; i < docs.length; i++) {
      locations.push(convertModelDataToObject(docs[i]));
    }
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, locations);
  }
}


/**
 * Returns all locations in ferropoly style, COMPLETE OBJECTS
 * @param callback
 */
async function getAllLocations(callback) {
  let docs, err;
  try {
    docs = await Location
      .find({})
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, docs);
  }
}


/**
 * Returns all locations in ferropoly style (no mongoose overhead, by using lean)
 * @param map : map ('zvv', 'sbb' or 'ostwind')
 * @param callback
 */
async function getAllLocationsForMap(map, callback) {
  let docs, err;
  try {
    // This creates a query in this format: {'maps.zvv': true}
    let index    = 'maps.' + map;
    let query    = {};
    query[index] = true;

    docs = await Location
      .find(query)
      .lean()
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, docs);
  }
}

/**
 * Gets one location by its uuid (or null, if it does not exist)
 * @param uuid
 * @param callback
 */
async function getLocationByUuid(uuid, callback) {
  let doc, err;
  try {
    const docs = await Location
      .find({uuid: uuid})
      .exec();

    if (docs.length === 0) {
      // No location found
      doc = null;
    } else {
      doc = docs[0];
    }
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, doc);
  }
}

/**
 * Count Locations
 * @param callback
 */
async function countLocations(callback) {
  let retVal, err;
  try {
    retVal = _.clone(mapinfo, true);

    retVal.all = await Location
      .countDocuments({})
      .exec();

    for (const m of retVal.maps) {
      // This creates a query in this format: {'maps.zvv': true}
      let index    = 'maps.' + m.map;
      let query    = {};
      query[index] = true;
      m.locationNb = await Location
        .countDocuments(query)
        .exec();
    }
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, retVal);
  }
}

/**
 * Convert Model Data to Object as used in Ferropoly (admin app)
 * @param data is a Location Model
 * @returns {{}} Ferropoly alike object
 */
function convertModelDataToObject(data) {
  let retVal           = {};
  retVal.name          = data.name;
  retVal.uuid          = data.uuid;
  retVal.position      = data.position;
  retVal.accessibility = data.accessibility;
  retVal.maps          = data.maps;
  return retVal;
}


/**
 * Save location
 * @param location
 * @param callback
 */
async function saveLocation(location, callback) {
  let savedLocation, err;
  try {
    savedLocation = await location.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, savedLocation);
  }
}

module.exports = {
  /**
   * The model of a location
   */
  Model: Location,

  /**
   * Get all locations in a lean style (not as model objects, just the data)
   */
  getAllLocations: getAllLocationsLean,

  /**
   * Get all locations as Model objects, ready to be saved
   */
  getAllLocationsAsModel: getAllLocations,

  /**
   * Gets all locations for a map
   */
  getAllLocationsForMap: getAllLocationsForMap,
  /**
   * Get one single location by its UUID (or null, if it does not exist)
   */
  getLocationByUuid: getLocationByUuid,

  /**
   * Save the location
   */
  saveLocation: saveLocation,

  /**
   * Count locations
   */
  countLocations: countLocations
};
