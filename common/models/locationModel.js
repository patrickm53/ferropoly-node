/**
 * This is the model of a location. A location can be used for games and belongs to different
 * kinds of maps. If it is used in a game, it becomes a property (in the game itself, only
 * properties are used. Locations are created in the admin-app and transformed to properties
 * in the editor app).
 *
 * Created by kc on 02.01.15.
 */

var mongoose       = require('mongoose');
var logger         = require('../lib/logger').getLogger('locationModel');
var mapinfo        = require('../lib/maps.json');
var _              = require('lodash');
var async          = require('async');
/**
 * The mongoose schema for a location
 */
var locationSchema = mongoose.Schema({
  name         : String,                       // Name of the location
  uuid         : {type: String, index: true},  // UUID of the location, this is the key we are referencing to
  position     : {lat: String, lng: String},   // position of the location
  accessibility: String,                       // How do we access it?
  maps         : {
    zvv    : Boolean,
    sbb    : Boolean,
    ostwind: {type: Boolean, default: false},
    libero : {type: Boolean, default: false},
    tva    : {type: Boolean, default: false},
    tvlu   : {type: Boolean, default: false},
    tnw    : {type: Boolean, default: false}
  }
}, {autoIndex: true});

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
  // This creates a query in this format: {'maps.zvv': true}
  var index    = 'maps.' + map;
  var query    = {};
  query[index] = true;

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
var getLocationByUuid     = function (uuid, callback) {
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
  var retVal = _.clone(mapinfo, true);

  Location.count({}, function (err, nb) {
    if (err) {
      retVal.all = 0;
    }
    else {
      retVal.all = nb;
    }

    async.each(retVal.maps,
      function (m, cb) {
        // This creates a query in this format: {'maps.zvv': true}
        var index    = 'maps.' + m.map;
        var query    = {};
        query[index] = true;

        Location.count(query, function (err, nb) {
          m.locationNb = nb;
          cb(err);
        });
      },
      function (err) {
        callback(err, retVal);
      }
    );
  });
};

/**
 * Convert Model Data to Object as used in Ferropoly (admin app)
 * @param data is a Location Model
 * @returns {{}} Ferropoly alike object
 */
var convertModelDataToObject = function (data) {
  var retVal           = {};
  retVal.name          = data.name;
  retVal.uuid          = data.uuid;
  retVal.position      = data.position;
  retVal.accessibility = data.accessibility;
  retVal.maps          = data.maps;
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
  getLocationByUuid    : getLocationByUuid,

  /**
   * Save the location
   */
  saveLocation: saveLocation,

  /**
   * Count locations
   */
  countLocations: countLocations
};
