/**
 * Common library for the pricelist
 * Created by kc on 26.04.15.
 */
'use strict';

var _ = require('lodash');
var properties = require('../models/propertyModel');

module.exports = {
  /**
   * Get the price list for a given game
   * @param gameId
   * @param callback
   */
  getPricelist: function (gameId, callback) {
    properties.getPropertiesForGameplay(gameId, null, function (err, props) {
      if (err) {
        return callback(err);
      }
      var pricelist = _.filter(props, function (p) {
        return p.pricelist.position > -1;
      });

      // Filter unused data
      for (var i = 0; i < pricelist.length; i++) {
        pricelist[i].gamedata = undefined;
        pricelist[i]._id = undefined;
        pricelist[i].__v = undefined;
        pricelist[i].gameId = undefined;
      }
      var sortedPricelist = _.sortBy(pricelist, function (p) {
        return p.pricelist.position;
      });

      return callback(null, sortedPricelist);
    })
  }
};
