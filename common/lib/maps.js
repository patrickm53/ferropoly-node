/**
 * This file loads maps.json and offers then all the maps to the application:
 * - internal as object
 * - "external" (web browser) as route
 *
 * Created by kc on 16.12.15.
 */

const maps          = require('./maps.json');
const locationModel = require('../models/locationModel');
const async         = require('async');
const _             = require('lodash');

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
   * &json=true              => output as json
   * @param req
   * @param res
   */
  routeHandler: function (req, res) {

    if (req.query.count) {
      locationModel.countLocations(function (err, info) {
        if (err) {
          return res.status(500).send(err.message);
        }
        if (req.query.json) {
          return res.send(info);
        }
        return res.send('var ferropolyMaps = ' + JSON.stringify(info) + ';');
      });
    }
    else if (req.query.locations) {
      let retVal = _.clone(maps, true);

      async.each(retVal.maps,
        function (m, cb) {
          locationModel.getAllLocationsForMap(m.map, function (err, locs) {
            if (err) {
              return cb(err);
            }

            locs = _.sortBy(locs, 'name');

            locs.forEach(function (loc) {
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
          if (req.query.json) {
            return res.send(retVal);
          }
          res.send('var ferropolyMaps = ' + JSON.stringify(retVal) + ';');
        }
      );
    }
    else {
      if (req.query.json) {
        return res.send(retVal);
      }
      res.send('var ferropolyMaps = ' + JSON.stringify(maps) + ';');
    }
  }
};
