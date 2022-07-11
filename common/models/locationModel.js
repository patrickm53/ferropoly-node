/**
 * This is the model of a location. A location can be used for games and belongs to different
 * kinds of maps. If it is used in a game, it becomes a property (in the game itself, only
 * properties are used. Locations are created in the admin-app and transformed to properties
 * in the editor app).
 *
 * Created by kc on 02.01.15.
 */

const mongoose       = require('mongoose');
const logger         = require('../lib/logger').getLogger('locationModel');
const mapinfo        = require('../lib/maps.json');
const _              = require('lodash');
const async          = require('async');
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
function getAllLocationsLean(callback) {
  Location.find({}).lean().exec(function (err, docs) {
    if (err) {
      logger.error('Location.find failed: ', err);
      return callback(err);
    }
    let locations = [];
    for (let i = 0; i < docs.length; i++) {
      locations.push(convertModelDataToObject(docs[i]));
    }
    return callback(null, locations);
  });
}

/**
 * Returns all locations in ferropoly style, COMPLETE OBJECTS
 * @param callback
 */
function getAllLocations(callback) {
  Location.find({}).exec(function (err, docs) {
    if (err) {
      logger.error('Location.find failed: ', err);
      return callback(err);
    }
    return callback(null, docs);
  });
}


/**
 * Returns all locations in ferropoly style (no mongoose overhead, by using lean)
 * @param map : map ('zvv', 'sbb' or 'ostwind')
 * @param callback
 */
function getAllLocationsForMap(map, callback) {
  // This creates a query in this format: {'maps.zvv': true}
  let index    = 'maps.' + map;
  let query    = {};
  query[index] = true;

  Location.find(query).lean().exec(function (err, docs) {
    if (err) {
      logger.error('LocationFind failed', err);
      return callback(err);
    }
    let locations = [];
    for (let i = 0;
         i < docs.length;
         i++
    ) {
      locations.push(docs[i]);
    }
    return callback(null, locations);
  });
}

/**
 * Gets one location by its uuid (or null, if it does not exist)
 * @param uuid
 * @param callback
 */
function getLocationByUuid(uuid, callback) {
  Location.find({uuid: uuid}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      // No location found
      return callback(null, null);
    }
    return callback(null, docs[0]);
  });
}

/**
 * Count Locations
 * @param callback
 */
function countLocations(callback) {
  let retVal = _.clone(mapinfo, true);

  Location.countDocuments({}, function (err, nb) {
    if (err) {
      retVal.all = 0;
    } else {
      retVal.all = nb;
    }

    async.each(retVal.maps,
      function (m, cb) {
        // This creates a query in this format: {'maps.zvv': true}
        let index    = 'maps.' + m.map;
        let query    = {};
        query[index] = true;

        Location.countDocuments(query, function (err, nb) {
          m.locationNb = nb;
          cb(err);
        });
      },
      function (err) {
        callback(err, retVal);
      }
    );
  });
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
function saveLocation(location, callback) {
  location.save(function (err, savedLocation) {
    callback(err, savedLocation);
  })
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
