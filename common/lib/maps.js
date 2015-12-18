/**
 * This file loads maps.json and offers then all the maps to the application:
 * - internal as object
 * - "external" (web browser) as route
 *
 * Created by kc on 16.12.15.
 */

'use strict';

var maps = require('./maps.json');
var locationModel = require('../models/locationModel');
var async = require('async');
var _ = require('lodash');

module.exports = {
  /**
   * Returns the maps as object
   */
  get: function () {
    return maps;
  },

  /**
   * Handler for a route, returns a complete JS-File
   *
   * /maps                   => just the maps with descriptions, this is the fastest options
   * /maps?count=true        => adds the number of locations for each map and over all
   * /maps?locations=true    => adds all locations and the number over all
   * @param req
   * @param res
   */
  routeHandler: function (req, res) {

    if (req.query.count) {
      locationModel.countLocations(function (err, info) {
        if (err) {
          return res.status(500).send(err.message);
        }
        return res.send('var ferropolyMaps = ' + JSON.stringify(info) + ';');
      });
    }
    else if (req.query.locations) {
      var retVal = _.clone(maps, true);

      async.each(retVal.maps,
        function (m, cb) {
          locationModel.getAllLocationsForMap(m.map, function(err, locs) {
            if (err) {
              return cb(err);
            }

            locs.forEach(function(loc) {
              delete loc._id;
              delete loc.position;
              delete loc.maps;
              delete loc.uuid;
              delete loc.__v;
            });

            m.locations = locs;
            cb();
          });
        },
        function (err) {
          if (err) {
            return res.status(500).send(err.message);
          }
          res.send('var ferropolyMaps = ' + JSON.stringify(retVal) + ';');
        }
      );
    }
    else {
      res.send('var ferropolyMaps = ' + JSON.stringify(maps) + ';');
    }
  }
};
