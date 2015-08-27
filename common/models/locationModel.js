/**
 * This is the model of a location. A location can be used for games and belongs to different
 * kinds of maps. If it is used in a game, it becomes a property (in the game itself, only
 * properties are used. Locations are created in the admin-app and transformed to properties
 * in the editor app).
 *
 * Created by kc on 02.01.15.
 */

var mongoose = require('mongoose');
var logger = require('../lib/logger').getLogger('locationModel');

/**
 * The mongoose schema for a location
 */
var locationSchema = mongoose.Schema({
  name: String, // Name of the location
  uuid: String, // UUID of the location, this is the key we are referencing to
  position: {lat: String, lng: String}, // position of the location
  accessibility: String, // How do we access it?
  maps: {
    zvv: Boolean,
    sbb: Boolean,
    ostwind: {type: Boolean, default: false}
  }
}, {autoIndex: false});
locationSchema.index({uuid: 1, type: -1}); // schema level

/**
 * The Location model
 */
var Location = mongoose.model('Location', locationSchema);

/**
 * Returns all locations in ferropoly style
 * @param callback
 */
var getAllLocations = function (callback) {
  Location.find({}).lean().exec(function (err, docs) {
    if (err) {
      logger.error('Location.find failed: ', err);
      return callback(err);
    }
    var locations = [];
    for (var i = 0; i < docs.length; i++) {
      locations.push(convertModelDataToObject(docs[i]));
    }
    return callback(null, locations);
  });
};


/**
 * Returns all locations in ferropoly style (no mongoose overhead, by using lean)
 * @param map : map ('zvv', 'sbb' or 'ostwind')
 * @param callback
 */
var getAllLocationsForMap = function (map, callback) {
  var query = {};
  if (map === 'zvv') {
    query = {'maps.zvv': true};
  }
  else if (map === 'ostwind') {
    query = {'maps.ostwind': true};
  }
  else {
    query = {'maps.sbb': true};
  }
  Location.find(query).lean().exec(function (err, docs) {
    if (err) {
      logger.error('LocationFind failed', err);
      return callback(err);
    }
    var locations = [];
    for (var i = 0; i < docs.length; i++) {
      locations.push(docs[i]);
    }
    return callback(null, locations);
  });
};
/**
 * Gets one location by its uuid (or null, if it does not exist)
 * @param uuid
 * @param callback
 */
var getLocationByUuid = function (uuid, callback) {
  Location.find({uuid: uuid}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length == 0) {
      // No location found
      return callback(null, null);
    }
    return callback(null, docs[0]);
  });
};

/**
 * Count Locations
 * @param callback
 */
var countLocations = function (callback) {
  var retVal = {};

  Location.count({}, function (err, nb) {
    if (err) {
      retVal.all = nb;
    }
    else {
      retVal.all = nb;
    }
    Location.count({'maps.zvv': true}, function (err, nb) {
      if (err) {
        retVal.zvv = -1;
      }
      else {
        retVal.zvv = nb;
      }
      Location.count({'maps.sbb': true}, function (err, nb) {
        if (err) {
          retVal.sbb = -1;
        }
        else {
          retVal.sbb = nb;
        }
        Location.count({'maps.ostwind':true}, function(err, nb) {
          if (err) {
            retVal.ostwind = -1;
          }
          else {
            retVal.ostwind = nb;
          }
          callback(null, retVal);
        });
      });
    });
  });
};

/**
 * Convert Model Data to Object as used in Ferropoly (admin app)
 * @param data is a Location Model
 * @returns {{}} Ferropoly alike object
 */
var convertModelDataToObject = function (data) {
  var retVal = {};
  retVal.name = data.name;
  retVal.uuid = data.uuid;
  retVal.position = data.position;
  retVal.accessibility = data.accessibility;
  retVal.maps = data.maps;
  return retVal;
};


/**
 * Save location
 * @param location
 * @param callback
 */
var saveLocation = function (location, callback) {
  location.save(function (err, savedLocation) {
    callback(err, savedLocation);
  })
};

module.exports = {
  /**
   * The model of a location
   */
  Model: Location,

  /**
   * Get all locations
   */
  getAllLocations: getAllLocations,

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
